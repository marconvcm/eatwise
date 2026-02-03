package app.py3kl.eatwise.settings

import app.py3kl.eatwise.profile.services.UserProfileService
import app.py3kl.eatwise.profile.utils.UserProfileArgumentResolver
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.ReactiveAuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.security.web.server.authentication.AuthenticationWebFilter
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter
import org.springframework.web.reactive.config.WebFluxConfigurer
import org.springframework.web.reactive.result.method.annotation.ArgumentResolverConfigurer
import reactor.core.publisher.Mono


@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class WebFluxConfig(
    @Autowired
    private val userProfileArgumentResolver: UserProfileArgumentResolver,
    @Autowired
    private val userProfileService: UserProfileService
) : WebFluxConfigurer {

    override fun configureArgumentResolvers(configurer: ArgumentResolverConfigurer) {
        configurer.addCustomResolver(userProfileArgumentResolver)
    }

    @Bean
    fun securityWebFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        val tokenAuthenticationFilter = AuthenticationWebFilter(tokenAuthenticationManager())
        tokenAuthenticationFilter.setServerAuthenticationConverter(tokenAuthenticationConverter())

        return http
            .authorizeExchange { exchanges ->
                exchanges
                    .pathMatchers("/actuator/**").permitAll()
                    .anyExchange().authenticated()
            }
            .addFilterAt(tokenAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .httpBasic { }
            .cors { it.disable() } // TODO: For development purposes; enable and configure properly in production
            .csrf { it.disable() }
            .build()
    }

    @Bean
    fun authenticationManager(): ReactiveAuthenticationManager {
        return ReactiveAuthenticationManager { authentication ->
            val username = authentication.name
            val password = authentication.credentials.toString()

            userProfileService.authenticateUserAsync(username, password)
                .flatMap { isAuthenticated ->
                    if (isAuthenticated) {
                        userProfileService.getUserProfileByEmailAsync(username)
                            .map { userProfile ->
                                UsernamePasswordAuthenticationToken(
                                    userProfile.email,
                                    password,
                                    if (userProfile.isAdmin) {
                                        listOf(SimpleGrantedAuthority("ROLE_ADMIN"), SimpleGrantedAuthority("ROLE_USER"))
                                    } else {
                                        listOf(SimpleGrantedAuthority("ROLE_USER"))
                                    }
                                ) as Authentication
                            }
                    } else {
                        Mono.error(BadCredentialsException("Invalid credentials"))
                    }
                }
        }
    }

    @Bean
    fun tokenAuthenticationManager(): ReactiveAuthenticationManager {
        return ReactiveAuthenticationManager { authentication ->
            val token = authentication.credentials.toString()

            userProfileService.getUserProfileByAccessTokenAsync(token)
                .flatMap { userProfile ->
                    Mono.just(
                        UsernamePasswordAuthenticationToken(
                            userProfile.email,
                            token,
                            if (userProfile.isAdmin) {
                                listOf(SimpleGrantedAuthority("ROLE_ADMIN"))
                            } else {
                                listOf(SimpleGrantedAuthority("ROLE_USER"))
                            }
                        ) as Authentication
                    )
                }
                .switchIfEmpty(Mono.error(BadCredentialsException("Invalid access token")))
        }
    }

    @Bean
    fun tokenAuthenticationConverter(): ServerAuthenticationConverter {
        return ServerAuthenticationConverter { exchange ->
            val authHeader = exchange.request.headers.getFirst(HttpHeaders.AUTHORIZATION)

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                val token = authHeader.substring(7)
                Mono.just(UsernamePasswordAuthenticationToken(token, token))
            } else {
                Mono.empty()
            }
        }
    }
}

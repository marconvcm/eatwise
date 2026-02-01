package app.py3kl.eatwise.profile.utils

import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.services.UserProfileService
import org.springframework.core.MethodParameter
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.reactive.BindingContext
import org.springframework.web.reactive.result.method.HandlerMethodArgumentResolver
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
annotation class CurrentUser

@Component
class UserProfileArgumentResolver(
    private val userProfileService: UserProfileService
) : HandlerMethodArgumentResolver {

    override fun supportsParameter(parameter: MethodParameter): Boolean =
        parameter.hasParameterAnnotation(CurrentUser::class.java) &&
                parameter.parameterType == UserProfile::class.java

    override fun resolveArgument(
        parameter: MethodParameter,
        bindingContext: BindingContext,
        exchange: ServerWebExchange
    ): Mono<Any> {
        return ReactiveSecurityContextHolder.getContext()
            .flatMap { context ->
                val username = context.authentication?.name ?: return@flatMap Mono.empty<String>()
                userProfileService.getUserProfileByEmailAsync(username)
            }
            .cast(Any::class.java)
            .switchIfEmpty(Mono.error(IllegalStateException("User profile not found for authenticated user")))
    }
}

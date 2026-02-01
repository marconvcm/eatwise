package app.py3kl.eatwise.settings

import com.github.doyaaaaaken.kotlincsv.dsl.csvReader
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class EatWiseApplicationSettings {

    @Bean
    fun factoryPasswordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean("FixtureUsers")
    fun fixtureUsers(): List<Map<String, String>> = readCsvResource("users.csv")

    @Bean("FixtureLedger")
    fun fixtureLedger(): List<Map<String, String>> = readCsvResource("sample.csv")

    private fun readCsvResource(resourcePath: String): List<Map<String, String>> {
        val resource = ClassPathResource(resourcePath)
        return csvReader().readAllWithHeader(resource.inputStream)
            .map { row -> row.mapValues { it.value.trim() } }
    }
}
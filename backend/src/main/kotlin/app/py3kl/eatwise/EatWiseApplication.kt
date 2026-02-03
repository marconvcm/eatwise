package app.py3kl.eatwise

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
class EatWiseApplication

fun main(args: Array<String>) {
	runApplication<EatWiseApplication>(*args)
}

inline fun <reified T> T.logger(): Logger =
    LoggerFactory.getLogger(T::class.java)

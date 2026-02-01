package app.py3kl.eatwise.mail

import app.py3kl.eatwise.logger
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers

@Service
class EmailService(
    private val mailSender: JavaMailSender
) {
    private val log = logger()

    fun sendSimpleEmailAsync(
        to: String,
        subject: String,
        text: String,
        from: String? = null
    ): Mono<Void> {
        return Mono.fromRunnable<Void> {
            try {
                val message = SimpleMailMessage()
                message.setTo(to)
                message.subject = subject
                message.text = text
                from?.let { message.from = it }

                mailSender.send(message)
                log.info("Email sent successfully to $to")
            } catch (e: MailException) {
                log.error("Failed to send email to $to", e)
                throw e
            }
        }.subscribeOn(Schedulers.boundedElastic()).then()
    }

    fun sendHtmlEmailAsync(
        to: String,
        subject: String,
        htmlContent: String,
        from: String? = null
    ): Mono<Void> {
        return Mono.fromRunnable<Void> {
            try {
                val mimeMessage = mailSender.createMimeMessage()
                val helper = MimeMessageHelper(mimeMessage, true, "UTF-8")

                helper.setTo(to)
                helper.setSubject(subject)
                helper.setText(htmlContent, true)
                from?.let { helper.setFrom(it) }

                mailSender.send(mimeMessage)
                log.info("HTML email sent successfully to $to")
            } catch (e: MailException) {
                log.error("Failed to send HTML email to $to", e)
                throw e
            }
        }.subscribeOn(Schedulers.boundedElastic()).then()
    }

    fun sendEmailWithAttachmentAsync(
        to: String,
        subject: String,
        text: String,
        attachmentName: String,
        attachmentData: ByteArray,
        from: String? = null
    ): Mono<Void> {
        return Mono.fromRunnable<Void> {
            try {
                val mimeMessage = mailSender.createMimeMessage()
                val helper = MimeMessageHelper(mimeMessage, true, "UTF-8")

                helper.setTo(to)
                helper.setSubject(subject)
                helper.setText(text)
                from?.let { helper.setFrom(it) }
                helper.addAttachment(attachmentName, { attachmentData.inputStream() })

                mailSender.send(mimeMessage)
                log.info("Email with attachment sent successfully to $to")
            } catch (e: MailException) {
                log.error("Failed to send email with attachment to $to", e)
                throw e
            }
        }.subscribeOn(Schedulers.boundedElastic()).then()
    }
}

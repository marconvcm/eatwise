package app.py3kl.eatwise.profile.controllers

import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileInvite
import app.py3kl.eatwise.profile.models.UserProfileInviteRequest
import app.py3kl.eatwise.profile.services.UserInviteService
import app.py3kl.eatwise.profile.services.UserProfileService
import app.py3kl.eatwise.profile.utils.CurrentUser
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
class UserProfileController(
    @Autowired
    val userProfileService: UserProfileService,
    @Autowired
    val userInviteService: UserInviteService
) {

    @GetMapping("/profile/me")
    fun getProfile(@CurrentUser profile: UserProfile): Mono<UserProfile> = Mono.just(profile)

    @PostMapping("/profile/invite")
    fun inviteUser(
        @CurrentUser profile: UserProfile,
        @RequestBody inviteRequest: UserProfileInviteRequest
    ): Mono<UserProfileInvite> =
        userInviteService.sendInvite(profile, inviteRequest)
}
package app.py3kl.eatwise.profile.services

import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileRequest
import reactor.core.publisher.Mono

interface UserProfileService {

    fun existsByEmail(email: String): Boolean

    fun getUserProfileByEmail(email: String): UserProfile?
    fun getUserProfileByAccessToken(accessToken: String): UserProfile?
    fun authenticateUser(email: String, password: String): Boolean

    fun authenticateByAccessToken(accessToke: String): Boolean

    fun setAccessTokenForUser(email: String, accessToken: String);

    fun createUserProfile(userProfile: UserProfileRequest): UserProfile
    fun createAdminUserProfile(userProfile: UserProfileRequest): UserProfile

    fun getUserProfileByEmailAsync(email: String): Mono<UserProfile> = Mono.justOrEmpty(getUserProfileByEmail(email))
    fun authenticateUserAsync(email: String, password: String): Mono<Boolean> = Mono.just(authenticateUser(email, password))
    fun createUserProfileAsync(userProfile: UserProfileRequest): Mono<UserProfile> = Mono.just(createUserProfile(userProfile))
    fun createAdminUserProfileAsync(userProfile: UserProfileRequest): Mono<UserProfile> = Mono.just(createAdminUserProfile(userProfile))
    fun getUserProfileByAccessTokenAsync(accessToken: String): Mono<UserProfile> = Mono.justOrEmpty(getUserProfileByAccessToken(accessToken))
}


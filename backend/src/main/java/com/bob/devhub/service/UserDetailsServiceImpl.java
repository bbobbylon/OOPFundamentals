package com.bob.devhub.service;

import com.bob.devhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
/**
 * Bridges DevHub's {@link com.bob.devhub.model.User} table to Spring Security's
 * {@link UserDetails} contract — the one place the framework is told how to find a user.
 *
 * <p>Called from two directions: by {@code DaoAuthenticationProvider} during a
 * username/password login, and by {@code JwtAuthFilter} on every authenticated request
 * to re-load the principal named in the token. The second is why this stays cheap and
 * why {@code User} implements {@code UserDetails} directly rather than being copied into
 * an adapter.
 */
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepo;

    @Override
    /**
     * Look up a user by username, or throw.
     *
     * <p>The message names the username, which looks like a user-enumeration leak and is
     * not one HERE: {@code DaoAuthenticationProvider} hides this exception behind a generic
     * "Bad credentials" by default, so a login attempt cannot tell "no such user" from
     * "wrong password". That protection is the PROVIDER'S, not this method's — anything
     * that calls this directly and surfaces the message to a caller reintroduces the leak.
     *
     * @throws UsernameNotFoundException if no such user exists
     */
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}

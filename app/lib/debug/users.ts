/**
 * Debug Users
 * Mock users for development and testing
 * DO NOT USE IN PRODUCTION
 */

export interface DebugUser {
   name: string;
   email: string;
   password: string;
   isAdmin: boolean;
   accessToken: string;
}

export const DEBUG_USERS: DebugUser[] = [
   {
      name: 'Kyle Reese',
      email: 'user1@example.com',
      password: 'password',
      isAdmin: false,
      accessToken: 'ElCDiubaMAmdcR5aPbTqnCOFRFLCULL52srxiFaTLTXjHCj6iQogaDzePHXKKDeveCK7irkutUE51CYrknMwpy8ioZlHncPgXcFW',
   },
   {
      name: "Sarah O'Connor",
      email: 'user2@example.com',
      password: 'password',
      isAdmin: false,
      accessToken: 'Q4T2iOai7IeHKJjd2mZNL8ItOSUcfwuRjf4qBt0iPRXa4n4fQd21NgcLSAwynozgn9wvuOZX3TnkrVw1sSPtfd5k1sRP5w3LyZhx',
   },
   {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
      isAdmin: false,
      accessToken: 'h0NT20c4qyisjenFf5WyaLq1DtybTfQInOBjtrZmrvvqUwNZvMELMrqIyzANe85ZLTHe6DFpAsTHoba6A9SMkbvDQWnLeHU1wVhI',
   },
   {
      name: 'Peter Parker',
      email: 'peter.parker@example.com',
      password: 'password',
      isAdmin: false,
      accessToken: 'M42PDq3Qjdqlb1i4LXWY0ItKticdJMhRjezhM9jjSD8LaF00Pdu03nX7mxPrNXVyhl8WM4z9fT7CQ80Gj12LUwD9pw4XjLKIXmBV',
   },
   {
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'adminpass',
      isAdmin: true,
      accessToken: 'PZGZPXajlj027UcNEZzkxw9SQTHVe7AldzCgVtYIIdtwlJV77c3wyoBGndiZxeQq0v3foK0cNnpejplTmpNuFUf5XaD41sj7PoRi',
   },
];

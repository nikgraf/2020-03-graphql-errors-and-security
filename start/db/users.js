const uuid = require("uuid/v4");

const users = [
  {
    id: "a5c48c89-8d11-4299-80bc-ee4e292788c3",
    email: "tim@example.com",
    password: "123", // NOTE never store a password in plain text
    role: "user",
    cart: {}
  },
  {
    id: "a36789ea-328e-495d-ae3e-58a080270dfd",
    email: "anna@example.com",
    password: "123", // NOTE never store a password in plain text
    role: "admin",
    cart: {}
  }
];

const sessions = [];

const login = (email, password) => {
  const user = users.find(
    user => user.email === email && user.password === password
  );
  if (user) {
    const token = uuid();
    const session = { token, userId: user.id };
    sessions.push(session);
    return { user, token };
  }
};

const getUserByToken = token => {
  const session = sessions.find(session => session.token === token);
  return users.find(user => session && user.id === session.userId);
};

const updateUser = updatedUser => {
  users.map(user => {
    if (user.id === updatedUser.id) {
      return updatedUser;
    }
    return user;
  });
  return updateUser;
};

module.exports = {
  login,
  getUserByToken,
  updateUser
};

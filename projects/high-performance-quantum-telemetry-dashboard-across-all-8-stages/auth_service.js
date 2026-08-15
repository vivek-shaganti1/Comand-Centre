const authenticate = async (username, password) => {
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.isPasswordValid(password))) {
      throw new Error('Invalid credentials');
    }
    return user;
  } catch (error) {
    throw error;
  }
};
module.exports = authenticate;
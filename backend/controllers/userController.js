import User from "../models/user.js";

//find every user in the database except for the authenticated user
// $ne operator selects all documents where the _id field is not equal to the specified value.
// select("-password") excludes the password field from the returned documents.  // NOT REFERENCE BUT ACTUAL USER DATA
// await keyword is used to make sure the execution of the code stops until the promise is resolved.
// If an error occurs during the execution, it will be caught and handled by the catch block.
// findOne() returns the first document that matches the query, or null if no match is found.

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

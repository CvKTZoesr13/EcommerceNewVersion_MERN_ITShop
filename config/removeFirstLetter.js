const removeFirstLetter = (string) => {
  if (string) {
    const firstSpaceIndex = string.indexOf(" ");
    const remainingPart = string.substring(firstSpaceIndex + 1);
    // if there is no whitespace in string -> return full of string
    return remainingPart;
  } else return "This account has no display name!";
};
module.exports = removeFirstLetter;

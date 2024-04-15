const profilePicSelect = document.getElementById("profile-pic");
const profileImage = document.getElementById("profile-image");

profileImage.src =
  "https://res.cloudinary.com/dh1ltpsm8/image/upload/v1713167792/ChatApp/profile-1_oejisw.png";

profileImage.addEventListener("click", () => {
  profilePicSelect.style.display = "block";
});

profilePicSelect.addEventListener("change", function () {
  const selectedValue = this.value;
  if (selectedValue == "1" || selectedValue == null) {
    profileImage.src =
      "https://res.cloudinary.com/dh1ltpsm8/image/upload/v1713167792/ChatApp/profile-1_oejisw.png";
  } else if (selectedValue == "2") {
    profileImage.src =
      "https://res.cloudinary.com/dh1ltpsm8/image/upload/v1713167795/ChatApp/profile-2_nqdbta.png";
  } else {
    profileImage.src =
      "https://res.cloudinary.com/dh1ltpsm8/image/upload/v1713167794/ChatApp/profile-3_ddoqkc.png";
  }
});

document.addEventListener("click", (event) => {
  if (event.target !== profileImage && event.target !== profilePicSelect) {
    profilePicSelect.style.display = "none";
  }
});

profilePicSelect.addEventListener("blur", () => {
  profilePicSelect.style.display = "none";
});

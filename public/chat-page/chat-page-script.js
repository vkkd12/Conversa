const socket = io("https://conversa-h9s7.onrender.com");

const USERNAME = document.querySelector("#USERNAME").innerText;
window.onload = () => {
  socket.emit("public", USERNAME);
  socket.emit("members");
};

// Logout
const logout = document.querySelector(".logoutButton");
if (logout) {
  logout.addEventListener("click", () => {
    socket.emit("leave");
  });
}

// Rate Limiting
let limit = true;
socket.on("limit", () => {
  limit = true;
});
const msgInput = document.querySelector(".inputMessage");
let messageForm = document.querySelector("#messageForm");
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (limit) {
    limit = false;
    if (msgInput.value) {
      socket.emit("message", msgInput.value);
      msgInput.value = "";
    }
    msgInput.focus();
    socket.emit("limit");
  }
});

// typing
msgInput.addEventListener("keyup", () => {
  socket.emit("typing", socket.id, msgInput.value.length);
});

// Listening for typing
let profiles = [];
const activity_head = document.getElementById("activity-head");
const activity = document.getElementById("activity");
socket.on("typing", (data, messageLength) => {
  let flag = profiles.some((span, index) => span.innerText === data);
  if (!flag) {
    let span = document.createElement("span");
    span.setAttribute("class", "users");
    span.innerText = data;
    profiles.push(span);
  }

  if (messageLength === 0) {
    profiles = profiles.filter((span) => span.innerText !== data);
  }

  activity.innerHTML = "";
  if (profiles.length === 0) {
    activity_head.style.display = "none";
  } else {
    activity_head.style.removeProperty("display");
    activity_head.style.zIndex = "2";
    profiles.forEach((span) => {
      activity.append(span);
    });
  }

  parentDiv.scrollTop = parentDiv.scrollHeight;
});

// Listening for messages
let parentDiv = document.getElementsByClassName("chats")[0];
// Your Message
socket.on("ourMessage", (name, data) => {
  activity.innerHTML = "";
  let temp = `${name} is typing...`;
  profiles.forEach((span, index) => {
    if (span.innerText === temp) {
      profiles.splice(index, 1);
    }
  });

  if (profiles.length === 0) {
    activity_head.style.display = "none";
  } else {
    activity_head.style.removeProperty("display");
    activity_head.style.zIndex = "2";
    profiles.forEach((span) => {
      activity.append(span);
    });
  }

  if (parentDiv) {
    let formatDate = time();
    let div = document.createElement("div");
    div.setAttribute("class", "sended-mssg");
    div.innerHTML = `
    <p>
      ${data}
    </p>
    `;

    parentDiv.append(div);
  } else {
    console.log("parentDiv not found");
  }
});

// Incoming messages
socket.on("messageForOther", (name, data) => {
  activity.innerHTML = "";

  let temp = `${name} is typing...`;
  profiles.forEach((span, index) => {
    if (span.innerText === temp) {
      profiles.splice(index, 1);
    }
  });

  if (profiles.length === 0) {
    activity_head.style.display = "none";
  } else {
    activity_head.style.removeProperty("display");
    activity_head.style.zIndex = "2";
    profiles.forEach((span) => {
      activity.append(span);
    });
  }

  if (parentDiv) {
    let formatDate = time();
    let div = document.createElement("div");
    div.setAttribute("class", "recieved-mssg");
    if (data) {
      div.innerHTML = `
      <h3>${name}</h3>
        <p>
          ${data}
        </p>
    `;
    } else {
      div.innerHTML = `
      <h2>${name}</h2>
    `;
    }

    parentDiv.append(div);

    parentDiv.scrollTo({
      top: parentDiv.scrollHeight,
      behavior: "smooth"
    });
  } else {
    console.log("parentDiv not found");
  }
});

function time() {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const period = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  // Convert '0' to '12'
  hours = hours ? hours : 12;

  const formattedDate = `${hours}:${minutes} ${period} ${day}/${month}/${year}`;
  return formattedDate;
}

/// for Members
const h2 = document.querySelector("#number_of_members");
const ul = document.querySelector(".member-list .members ol");
socket.on("members", (names) => {
  h2.innerText = `Members: ${names.length}`;
  ul.innerHTML = "";
  names.forEach((member) => {
    let li = document.createElement("li");
    li.innerText = member;
    ul.append(li);
  });
});

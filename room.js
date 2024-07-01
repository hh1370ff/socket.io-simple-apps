const socket = io("http://localhost:3000");

const accountH1 = document.getElementById("account");
const usernameInput = document.getElementById("usernameInput");
const [rightArea] = document.getElementsByClassName("right");
const [leftArea] = document.getElementsByClassName("left");

socket.on("connect", () => {
  writeEvent(leftArea, "default");
  writeEvent(rightArea, "vip");
});

function writeEvent(area, room) {
  const userList = area.querySelector(".users-list");
  const eventList = area.querySelector(".events-list");

  area.addEventListener("click", (e) => {
    const targetClassName = e.target.className;

    if (!generateEvent()) return;

    emitEvent();

    function generateEvent() {
      return ["join", "ping", "private-ping"].includes(targetClassName)
        ? true
        : false;
    }

    function emitEvent() {
      if (targetClassName === "join") {
        const username = usernameInput.value;
        accountH1.innerText = username;
        socket.emit("join", { username, room });
        usernameInput.value = "";
      } else if (targetClassName === "ping") {
        socket.emit("ping", { room });
      } else if (targetClassName === "private-ping") {
        const pingedSocketId = e.target.getAttribute("socketId");
        socket.emit("private-ping", { pingedSocketId, room });
      }
    }
  });

  attachSocketListeners();
  function attachSocketListeners() {
    socket.on("join", (data) => {
      const { username, socketId, room: joinedRoom } = data;
      console.log("🚀 ~ socket.on ~ joinedRoom:", joinedRoom);
      console.log("🚀 ~ socket.on ~ socketId:", socketId);
      console.log("🚀 ~ socket.on ~ username:", username);
      if (room !== joinedRoom) return;
      const li = document.createElement("li");
      userList.append(li);

      const span = document.createElement("span");
      span.innerText = username;
      li.appendChild(span);

      const button = document.createElement("button");
      button.classList.add("private-ping");
      button.innerText = "ping me";
      button.setAttribute("socketId", socketId);
      li.appendChild(button);
    });

    socket.on("ping", ({ private, username, room: pingedRoom }) => {
      if (room !== pingedRoom) return;
      private
        ? addPingMessage(`username: ${username} pinged you in private mode`)
        : addPingMessage(`username: ${username} the server`);
    });

    function addPingMessage(message) {
      console.log("🚀 ~ addPingMessage ~ message:", message);
      const li = document.createElement("li");
      li.innerText = message;
      eventList.appendChild(li);
    }
  }
}

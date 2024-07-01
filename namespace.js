const socket = io("http://localhost:3000");
const vipSocket = io("http://localhost:3000/vip");

const accountH1 = document.getElementById("account");
const usernameInput = document.getElementById("usernameInput");
const [rightArea] = document.getElementsByClassName("right");
const [leftArea] = document.getElementsByClassName("left");

socket.on("connect", () => {
  writeEvent(leftArea, socket);
  writeEvent(rightArea, vipSocket);
});

function writeEvent(area, socket) {
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
        socket.emit("join", { username });
        usernameInput.value = "";
      } else if (targetClassName === "ping") {
        socket.emit("ping");
      } else if (targetClassName === "private-ping") {
        const pingedSocketId = e.target.getAttribute("socketId");
        socket.emit("private-ping", { pingedSocketId });
      }
    }
  });

  attachSocketListeners();
  function attachSocketListeners() {
    socket.on("join", ({ username, socketId }) => {
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

    socket.on("ping", ({ private, username }) => {
      console.log("🚀 🚀 🚀 🚀 🚀 🚀 ");
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

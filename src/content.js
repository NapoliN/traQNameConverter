console.log("script loaded");
const getUsersFromPortalAPI = async () => {
  console.log("portal api load");
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ request: "Portal" }, (response) => {
      resolve(response);
    });
  });
};

const getUsersFromtraQAPI = async () => {
  console.log("traq api load");
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ request: "traQ" }, (response) => {
      resolve(response);
    });
  });
};

let users = undefined;
let userstraQ = undefined;

const modifyContent = async () => {
  if (users === undefined) {
    users = await getUsersFromPortalAPI();
  }
  if (userstraQ === undefined) {
    userstraQ = await getUsersFromtraQAPI();
  }
  // 各MessageElementに対して処理
  document.querySelectorAll("[class*=_messageHeader_]").forEach((element) => {
    // UserIDを取得
    const idElement = Array.from(element.children).find((child) =>
      Array.from(child.classList).some((cname) => cname.includes("_name_"))
    );
    if (idElement === undefined || idElement.textContent.includes("@BOT_")) {
      return;
    }

    const userID = idElement.textContent.substring(1);
    const userInfo = users.find((u) => u["id"] === userID);
    if (userInfo === undefined)return;
  
    const displayNameElement = Array.from(element.children).find((child) =>
      Array.from(child.classList).some((cname) =>
        cname.includes("_displayName_")
      )
    );
    if (displayNameElement !== undefined) {
      displayNameElement.textContent = userInfo["name"];
    }
  });

  document.querySelectorAll("[class*=_stampList_]").forEach((stampsElement) => {
    Array.from(stampsElement.children)
      .filter((child) =>
        Array.from(child.classList).some((cname) => cname.includes("_stamp_"))
      )
      .forEach((stampElement) => {
        const stampUser = Array.from(stampElement.children).find(child => Array.from(child.classList).some(cname => cname.includes("_container_")))
        if(stampUser === undefined)return;
        Array.from(stampUser.children).filter(child => Array.from(child.classList).some(cname => cname.includes("_container_"))).forEach(content => {
          const userDisplayName = Array.from(content.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join(' ');
          const userInfoFromtraQ = userstraQ.find((u) => u["displayName"] === userDisplayName)
          if(userInfoFromtraQ === undefined)return;
          const userInfoFromPortal = users.find((u) => u["id"] == userInfoFromtraQ["name"])
          if(userInfoFromPortal === undefined)return;
          Array.from(content.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)[0].textContent = userInfoFromPortal["name"]
        })
      });
  });
};

// MutationObserverを設定して動的に追加される要素を監視
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      modifyContent();
    }
  });
});

async function fetchUsers() {
  try {
    users = await getUsersFromPortalAPI();
    userstraQ = await getUsersFromtraQAPI();

    modifyContent();

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error("エラーが発生しました:", error);
    // エラーのハンドリングが必要な場合はここで行います
  }
}

fetchUsers();

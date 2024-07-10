const getUsersFromPortalAPI = async () => {return await fetch("https://portal.trap.jp/api/user",{
    credentials: "include"
}).then(async res => {
  return await res.json()
})
}

const getUsersFromtraQAPI = async () => {
  return await fetch("https://q.trap.jp/api/v3/users",{
    credentials: "include"
  }).then(async res => {
    return await res.json()
  })
}

chrome.runtime.onMessage.addListener((mes, sender, response) => {
  if(mes.request == "Portal"){
    getUsersFromPortalAPI().then((users) => {
      response(users)
    })
  }else if(mes.request == "traQ"){
    getUsersFromtraQAPI().then((users) => {
      response(users)
    })
  }
  return true
});
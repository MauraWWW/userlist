const BASE_URL ='https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 24

const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const users = []
let filteredUserList = []

function renderUserList(data) {
  rawHtml = ''
  data.forEach( item => {
    rawHtml += `
      <div class="col-sm-2 mb-3">
        <div class="card">
          <img src="${item.avatar}" class="card-img-top" alt="user avatar">
          <div class="card-body d-flex justify-content-center ">
          <h6 class="show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id=${item.id}>${item.name} ${item.surname}</h6>
          </div>
          <div class="card-footer d-flex justify-content-end">
            <i class="fas fa-plus-circle" style="color: #f28a38" data-id="${item.id}"></i>
            </div>
        </div>
      </div>
    `
  })
  userPanel.innerHTML = rawHtml
}

function getUsersByPage(page) {
  const data = filteredUserList.length ? filteredUserList : users
  const startIndex = (page-1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function showUserInfo(id) {
  const modalTitle = document.querySelector('.modal-title')
  const modalImage = document.querySelector('#modal-image')
  const modalAge = document.querySelector('#modal-age')
  const modalGender = document.querySelector('#modal-gender')
  const modalBirthday = document.querySelector('#modal-birthday')
  const modalEmail = document.querySelector('#modal-email')
  console.log(id)

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data
    modalTitle.innerText = `${data.name} ${data.surname}`
    modalAge.innerText = `Age: ${data.age}`
    modalGender.innerText = `Gender: ${data.gender}`
    modalBirthday.innerText = `Birthday: ${data.birthday}`
    modalEmail.innerText = `Email: ${data.email}`
    modalImage.innerHTML = `<img style="width: 15rem" src="${data.avatar}" alt="user avatar" class="img-fluid">`
  })
}

function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find(user => user.id === id)
  if(list.some(user => user.id === id)){
    return alert('已存入最愛清單!')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHtml = ''
  for(let page = 1; page <= numberOfPages; page++) {
    rawHtml += `
     <li class="page-item"><a class="page-link link-secondary" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHtml
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  for(const user of users){
    if (user.surname.toLowerCase().includes(keyword) || user.name.toLowerCase().includes(keyword)){
      filteredUserList.push(user)
    }
  }
  if(filteredUserList.length === 0){
    return alert(`未找到你輸入的關鍵字${keyword}的使用者`)
  }

  renderPaginator(filteredUserList.length)
  renderUserList(getUsersByPage(1))
})

userPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.show-user')){
    showUserInfo(Number(event.target.dataset.id))
  } else if (event.target.matches('.fa-plus-circle')){
    // console.log(Number(event.target.dataset.id))
    addToFavorite((Number(event.target.dataset.id)))
  }

})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // console.log('hi')
  if(event.target.tagName !== 'A') return 
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
  console.log(Number(event.target.dataset.page))
  
})

axios.get(INDEX_URL).then(response => {
  for( const user of response.data.results){
    users.push(user)
  }
  renderPaginator(users.length)
  renderUserList(getUsersByPage(1))
})
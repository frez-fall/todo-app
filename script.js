//Styles for dark and light theme
const themeSettings = {
    darkTheme : {
        "--background": "hsl(235, 21%, 11%)",
        "--active-todos": "hsl(234, 39%, 85%)",
        "--btn-hover": "hsl(236, 33%, 92%)",
        "--wrapper": "hsl(235, 24%, 19%)",
        "--borders": "hsl(233, 14%, 35%)",
        "--gray": "hsl(234, 11%, 52%)",
        "--active-btn": "rgba(74,121,214,255)",

    },
    lightTheme : {
        "--background" : "hsl(236, 33%, 92%)",
        "--active-todos" : "hsl(235, 19%, 35%)",
        "--btn-hover" : "hsl(235, 19%, 35%)",
        "--wrapper" : "hsl(0, 0%, 98%)",
        "--borders" : "hsl(233, 11%, 84%)",
        "--gray" : "hsl(236, 9%, 61%)",
        "--active-btn" : "rgba(74,121,214,255)",
    }
};

//function for setting css properties depending on theme
const setThemeProps = function (theme, mode, icon) {
    let selectedTheme = themeSettings[theme];
    for(props in selectedTheme){
        body.style.setProperty(props, selectedTheme[props]);
    }
    (window.matchMedia("(max-width: 576px)").matches) ? body.style.setProperty("background-image", `url(images/bg-mobile-${mode}.jpg)`):body.style.setProperty("background-image", `url(images/bg-desktop-${mode}.jpg)`);
    modeIcon.src = `images/icon-${icon}.svg`;
};

//sets theme depending on user preference on browser or through theme button
const setTheme = function(isThemeDark){
    if (isThemeDark){
        setThemeProps("darkTheme", "dark", "sun");
    }else{
        setThemeProps("lightTheme", "light", "moon");
    }
};

const body = document.body;

//read preferred theme on browser 
let theme = window.matchMedia("(prefers-color-scheme: dark)"); 
const modeIcon = document.querySelector("#mode-icon");

//set initial styling on browser preference
setTheme(theme.matches); 

//set properties on change of browser theme preference.
theme.addEventListener("change",({ matches }) => {
    setTheme(matches);
});

//change banner image on mobile devices
window.addEventListener("resize", ()=>{
    setTheme(theme.matches);
});

//change theme on mode icon
modeIcon.addEventListener("click", ()=>{
    body.classList.toggle("selected");
    (body.classList.contains("selected")) ? setTheme(!theme.matches) : setTheme(theme.matches);
});

let todoItems = [];
countActiveTodos();

//Todo list object
const addTodo = function(text){
    const todo = {
        text,
        checked: false,
        id: Date.now()
    };

    todoItems.push(todo);
    renderTodo(todo);
};

//Counts all active todo items
function countActiveTodos (){
    const counter = document.querySelector("#count-items");
    const activeTodos = todoItems.filter(item => item.checked === false); 
    counter.innerHTML = `${activeTodos.length} items left`;
};

//add todo from input into todoItems array
const form = document.querySelector("#current-form");
form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if(text!=""){
        addTodo(text);
        input.value = "";
        input.focus();
    }
    countActiveTodos();
});

//Renders todo items into DOM
function renderTodo(todo){
    const list = document.querySelector("#list-todos");
    let isChecked = (todo.checked) ? ["completed", "checked"] : ["active", ""]
    const node = document.createElement("div");
    node.setAttribute("class", `todos ${isChecked[0]}`);
    node.setAttribute("data-key", todo.id);
    node.setAttribute("draggable", "true");
    node.innerHTML = `
        <span>
            <input class ="check-box" type="checkbox" id="${todo.id}" ${isChecked[1]}>
            <label class="todo-text" for=${todo.id}>${todo.text}</label>
        </span>
        <button class="delete-btn" type="button" title="delete"><img src="images/icon-cross.svg" alt="delete button"></button>
    `;
    list.append(node);
    const todoText = node.querySelector("span>label");

    //Set line-through for completed todo items
    if(isChecked[1]=="checked"){
        todoText.style.setProperty("text-decoration", "line-through");
    }
};

//get event.target id and set check as true/false in object with the same id inside todo Array
const updateTodo = function(target, style, id){
    let targetContainer = target.parentNode.parentNode;
    let targetLabel = target.parentNode.querySelector("label");
    targetLabel.style.setProperty("text-decoration", `${style}`);
    let targetId = parseInt(id);
    let targetObj = todoItems.filter(item => item.id === targetId);
    targetObj[0].checked = !targetObj[0].checked;
    if(targetContainer.classList.contains("completed")){
        targetContainer.classList.remove("completed");
        targetContainer.classList.add("active");
    }else{
        targetContainer.classList.add("completed");
        targetContainer.classList.remove("active");
    }
};

//Check check box or delete todo item 
const container = document.querySelector('#list-todos');
container.addEventListener('click', event => {
    let target = event.target;
    if(target.tagName === "INPUT"){
        (target.checked) ? 
            (updateTodo(target, "line-through", target.id)) :
            (updateTodo(target, "none", target.id));
    }
    if(target.getAttribute("alt")==="delete button"){
        let targetContainer = target.parentNode.parentNode;
        let containerKey = targetContainer.getAttribute("data-key");
        deleteTodos(containerKey, targetContainer);
    }
    countActiveTodos();
});

//Function for deleting todo items in the DOM and in todoItems array
const deleteTodos = function(key, toDelete){
    let id = parseInt(key);
    let index = todoItems.findIndex(item => item.id === id);
    todoItems.splice(index,1);
    toDelete.remove();
};

//Drag and drop to rearrange todo list
container.addEventListener("dragstart", (e)=>{
    if(e.target.classList.contains("todos")){
        e.target.classList.add("dragging");
    }
});

container.addEventListener("dragend", (e)=>{
    if(e.target.classList.contains("todos")){
        e.target.classList.remove("dragging");
    }
    sortTodoItems();
    console.log(todoItems);
});

container.addEventListener("dragover", (e)=>{
    e.preventDefault(); 
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    
    if(afterElement == null){
        //adds the element being dragged as the last child of the container
        container.appendChild(draggable); 
    }else{
        container.insertBefore(draggable, afterElement);
    }
});

//adds the element being dragged based on cursor position
function getDragAfterElement(container,y){
    const draggableElements = [...container.querySelectorAll(".todos:not(.dragging)")];

    //determine which element is directly after the mouse cursor based on the y position passed
    return draggableElements.reduce((closest, child)=>{

        //get info about the rectangles bounding each child
        const box = child.getBoundingClientRect(); 

        //calculate the distance between the cursor and the center of the closest child
        const offset = y - box.top - box.height / 2;

        //the closest negative offset is the element directly below the cursor
        if(offset<0 && offset>closest.offset){ 
            //return the offset and child currently being iterated through
            return{ offset: offset, element: child}
        }else{
            return closest ;
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element //set any offset is initially greater than the default offset
};

//Sort items in todoItems array based on reordered list in DOM
function sortTodoItems (){
    const todos = document.querySelectorAll(".todos");
    const idList = [];
    
    //Store element id in an array based on arrangement in DOM
    for(item of todos){
        let id = parseInt(item.getAttribute("data-key"));
        idList.push(id);
    }

    //Sort todoItems array based on idList
    todoItems.sort(function (a, b) {
        return idList.indexOf(a.id) - idList.indexOf(b.id);
    });
};

//Filter Todo list
const filterBtns = document.querySelectorAll(".filter");
for (button of filterBtns){
    button.addEventListener("click", function(){
        (document.querySelector(".filter.selected")) ? (document.querySelector(".filter.selected").classList.remove("selected")) : '';
        this.classList.add("selected");
        filterTodos(this.getAttribute('value'));
    });
};

//Render todo items based on selected filter button
const filterTodos = function(value){
    const todos = document.querySelectorAll(".todos");
    todos.forEach(item =>{
        item.remove();
    });
    if (value === "Completed"){
        let checkedItems = todoItems.filter(item => item.checked === true);
        checkedItems.forEach(item =>{
            renderTodo(item);
        });
    }else if (value === "Active"){
        let activeItems = todoItems.filter(item => item.checked === false);
        activeItems.forEach(item =>{
            renderTodo(item);
        });
    }else{
        todoItems.forEach(item =>{
            renderTodo(item);
        });
    }
};

//Delete all completed todo items
const clearCompleted = document.querySelector("#clear>input");
clearCompleted.addEventListener("click", function(){
        let completedTodos = document.querySelectorAll(".completed");
        completedTodos.forEach(todo =>{
            let dataKey = todo.getAttribute("data-key");
            deleteTodos(dataKey, todo);
    });
});

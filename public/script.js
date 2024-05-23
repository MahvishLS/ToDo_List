function handleMarkAsDone(event) {
  if (event.target.classList.contains("mark-as-done")) {
    const taskId = event.target.dataset.taskId;
    console.log(taskId);

    fetch(`/api/delete-task/${taskId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to mark task as done");
        }
        event.target.parentElement.remove();
      })
      .catch((error) => console.error("Error marking task as done:", error));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/tasks")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((tasks) => {
      // Sort 
      tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      const tasksContainer = document.querySelector(".tasks");
      tasks.forEach((task) => {
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card", "col-3");
        const descriptionText = task.description ? task.description : "No Description";
        taskCard.innerHTML = `
          <h2 class="task-title">${task.title}</h2>
          <p>${descriptionText}</p>
          <button class="btn btn-success mark-as-done" data-task-id="${task.id}">Mark as Done</button>
          
          <a href="edit.html?id=${task.id}" class="btn btn-outline-info">Edit</a>
          <p class="time-left">${new Date(task.deadline).toLocaleString()}</p>
        `;

        const deadline = new Date(task.deadline);
        const now = new Date();
        const timeLeft = deadline - now;
        const oneHour = 60 * 60 * 1000;
        const fiveHour = 5 * oneHour;
        const oneDay = 24 * 60 * 60 * 1000;

        if (timeLeft <= fiveHour) {
          taskCard.classList.add("due-soon");
        } else if (timeLeft <= oneDay) {
          taskCard.classList.add("due-later");
        } else {
          taskCard.classList.add("on-time");
        }

        tasksContainer.appendChild(taskCard);
      });
    })
    .catch((error) => console.error("Error:", error));
  document.querySelector(".tasks").addEventListener("click", handleMarkAsDone);
});

// event listener to "Edit" buttons
const editButtons = document.querySelectorAll(".edit-task");
editButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const taskId = event.target.dataset.taskId;
    if (taskId) {
      window.location.href = `edit.html?id=${taskId}`;
    } else {
      console.error("Task ID is missing");
    }
  });
});

let count = localStorage.getItem('count4') ? parseInt(localStorage.getItem('count4')) : 0;
function countCalls(){ 
  if(count === 0){  
    count++;
    localStorage.setItem('count4', count);
  }else{    
    let registerLabel = document.getElementById("register-label");
    registerLabel.href= 'emailSettings.html';
    registerLabel.innerText = 'Email Settings';
  }
}

let registerLabel = document.getElementById("register-label");
registerLabel.addEventListener('click', () =>{
  countCalls();

} )
 

userProfile.addEventListener("click", ()=>{
  fetch("/api/user")
});

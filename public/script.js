document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
  
    taskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
  
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (response.ok) {
          taskForm.reset();
          fetchTasks();
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    });
  
    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks");
        const tasks = await response.json();
        taskList.innerHTML = "";
        tasks.forEach((task) => {
          const li = document.createElement("li");
  
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = task.properties.Status.select.name === "Completed";
          checkbox.addEventListener("change", async (event) => {
            event.preventDefault(); // Prevent default checkbox behavior
            await updateTaskStatus(
              task.id,
              event.target.checked ? "Completed" : "Not Started"
            );
          });
  
          const taskText = document.createElement("span");
          taskText.textContent = `${task.properties.Title.title[0].plain_text}: ${task.properties.Description.rich_text[0].plain_text}`;
  
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", () => deleteTask(task.id));
  
          li.appendChild(checkbox);
          li.appendChild(taskText);
          li.appendChild(deleteButton);
          taskList.appendChild(li);
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  
    async function updateTaskStatus(taskId, status) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (response.ok) {
          await fetchTasks(); // Refetch tasks after successful update
        } else {
          throw new Error("Failed to update task status");
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        // Revert the checkbox state if the update fails
        const checkbox = document.querySelector(
          `input[type="checkbox"][data-task-id="${taskId}"]`
        );
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
      }
    }
  
    async function deleteTask(taskId) {
      if (confirm("Are you sure you want to delete this task?")) {
        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            fetchTasks();
          }
        } catch (error) {
          console.error("Error deleting task:", error);
        }
      }
    }
  
    fetchTasks();
  });
  
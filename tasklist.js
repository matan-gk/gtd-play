

var taskList = [];
var nextId = 1;

var addTask = (title, body) => {

    var newTask = {
        id: nextId,
        title,
        body
    };
    nextId++;
    taskList.push(newTask);
    return newTask;

};

var deleteTask = (id) => {
    tasklistAfterRemoval = taskList.filter((task) => task.id !== id);
    if (tasklistAfterRemoval.length + 1 === taskList.length) {
        taskList = tasklistAfterRemoval;
        return true;
    }
    else return false;
};

var getTasklist = () => {
    return taskList;
}

var getTaskById = (id) => {
    taskList.forEach((task) => {
        if (task.id === id) return task;
    })
    return undefined;
};

module.exports = {
    getTaskById,
    getTasklist,
    addTask,
    deleteTask
}
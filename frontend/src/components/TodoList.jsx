import React from "react";
import TodoBox from "./TodoBox";

const TodoList = ({
  todoList,
  handleDelete,
  handleCheckboxChange,
  handleOpenTodoDetails,
  handleAddNote,
  handleEditNote,
}) => {
  return (
    <>
      {todoList?.map((todo) => (
        <TodoBox
          key={todo?.id}
          todo={todo}
          handleDelete={handleDelete}
          handleCheckboxChange={handleCheckboxChange}
          handleOpenTodoDetails={handleOpenTodoDetails}
          handleAddNote={handleAddNote}
          handleEditNote={handleEditNote}
        />
      ))}
    </>
  );
};

export default TodoList;

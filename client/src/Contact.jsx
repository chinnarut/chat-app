import React from 'react';
import Avatar from './Avatar';

const Contact = ({id, username, onClick, selected, online}) => {
  
  return (
    <div 
      className={"border-b border-gray-100 flex items-center gap-2 " + (selected ? "bg-blue-50" : "")}
      onClick={() => {onClick(id)}}
    >
      {selected && (
        <div className="w-1 bg-blue-500 h-12"></div>
      )}
        <div 
          className="flex items-center justify-center gap-2 py-2 pl-4 rounded-r-md"
        >
          <Avatar
            online={online}
            username={username} 
            userId={id} 
          />
          <span className="text-gray-600 pl-2">
            {username}
          </span>
        </div>
    </div>
  )
}

export default Contact

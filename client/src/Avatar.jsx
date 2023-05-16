import React from 'react';

const Avatar = ({online, username, userId}) => {
  const colors = ["bg-red-200", "bg-green-200", "bg-blue-200", "bg-purple-200", "bg-yellow-200", "bg-teal-200"];
  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div 
      className={"w-9 h-9 relative rounded-full flex items-center justify-center opacity-70 " + color}
    >
      {username[0]}
      {online && (
        <div 
         className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"
        >
        </div>
      )}
      {!online && (
        <div 
        className="absolute w-3 h-3 bg-gray-200 bottom-0 right-0 rounded-full border border-white"
       >
       </div>
      )}
    </div>
    
  )
}

export default Avatar

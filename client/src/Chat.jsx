import React, { useContext, useEffect, useRef, useState } from 'react';
import { uniqBy } from "lodash";
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';
import axios from 'axios';
import Contact from './Contact';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({})
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, setUsername, id, setId } = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(()=> {
    connectToWs();
  }, []);

  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:5000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected: trying to reconnect...");
        connectToWs();
      }, 1000);
    });
  };

  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    // console.log(e, messageData);
     if("online" in messageData) {
        showOnlinePeople(messageData.online);
     } else if("text" in messageData) {
      if(messageData.sender === selectedUserId) {
        setMessages(prev => ([...prev, {...messageData}]));
      }
     }
  };

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({userId, username}) => {
      people[userId] = username;
    });

    setOnlinePeople(people);
  };

  const showMessage = (e, file=null) => {
    if(e) e.preventDefault();

    ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
    }));

    setNewMessageText("");
    setMessages(prev => ([...prev, {
      text: newMessageText, 
      sender: id,
      recipient: selectedUserId,
      _id: Date.now()
    }]));

    if(file) {
      axios.get("/message/" + selectedUserId).then(res => {
        setMessages(res.data);
      })
    }
  };

  const sendFile = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      showMessage(null, {
        name: e.target.files[0].name,
        data: reader.result
      });
    };
  };

  const logout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if(div) {
      div.scrollIntoView({behavior: "smooth", block: "end"});
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));

      const offlinePeople = {}
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      
      setOfflinePeople(offlinePeople);
    })
  }, [onlinePeople]);

  useEffect(() => {
    if(selectedUserId) {
      axios.get("/messages/" + selectedUserId).then(res => {
        setMessages(res.data);
      })
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDups = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact 
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId} 
            />
          ))}
          {Object.keys(offlinePeople).map(userId => (
            <Contact 
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId} 
            />
          ))}
        </div>
        <div className="flex items-center p-2 text-center">
          <span className="flex items-center mr-2 text-sm text-gray-600"> 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button 
            onClick={logout}
            className="text-sm text-gray-500 bg-blue-100 py-1 px-2 border rounded-sm"
          >
            logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400 ">&larr; Chat with friend from sidebar</div> 
            </div>
          )}
          {selectedUserId && (
            <div className="relative h-full">
              <div
                className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2"
              >
                {messagesWithoutDups.map(message => (
                  <div key={message?._id} className={(message?.sender === id ?  "text-right" : "text-left")}>
                    <div
                      className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message?.sender === id ? "bg-blue-500 text-white" : "bg-white text-gray-500")}
                    >
                      {message.text}
                      {message.file && (
                        <div className="">
                          <a 
                            target="_blank"
                            className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + "/uploads/" + message.file}
                          >
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className="flex gap-2" onSubmit={showMessage}>
            <input 
            type="text" 
            value={newMessageText}
            onChange={e => setNewMessageText(e.target.value)}
            placeholder="Type your message here" 
            className="bg-white border p-2 flex-grow rounded-sm outline-none" 
            /> 
            {/* <label 
              className="bg-blue-200 cursor-pointer p-2 text-gray-600 border border-blue-200 rounded-sm"
            >
              <input type="file" className="hidden" onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label> */}
            <button type="submit" className="bg-blue-500 cursor-pointer p-2 text-white rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"     strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>  
          </form>
        )}
      </div>
    </div>
  )
}

export default Chat
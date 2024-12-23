import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Textarea, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import '../styles/Default.css';

const EMAIL_REGEX = new RegExp(/^[^\s;]+@[^\s;]+\.[^\s;]*$/)

function FeedbackForm(this: any) {
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();


  function sendFeedback() {
    // checks that feedback was entered and that
    // if there is an email entered, it resembles email format.
    if (text.length === 0) {
      alert("Please fill in the feedback text box.")
    } else if ((email.length > 0) && !EMAIL_REGEX.test(email)) {
      alert("Please enter a valid email.");
    } else {
      // TODO when send complete, show message and return to to main page
      alert("Email a message: "+text)
      navigate("/")
    }
  }

  return (
    <div className="DefaultPage" style={{marginLeft:50, marginRight:50}}>
        <h1 style={{textAlign: "center"}}>Avian Influenza Feedback</h1>  
        <Link to="/">Return to App</Link>
        <TextInput
          style={{width:300, marginTop:20}}
          label="Provide your email to receive a response."
          placeholder="Your email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <Textarea
          style={{marginTop:20, marginBottom:20}}
          label="Please provide feedback."
          autosize
          minRows={2}
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
        />
        <Button 
          rightSection={<IconSend size={14}/>} 
          onClick={() => {sendFeedback()}}
        >
          Submit Feedback
        </Button>

    </div>
  );
}

export default FeedbackForm;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Textarea, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import emailjs from 'emailjs-com';

import '../styles/Default.css';

const EMAIL_REGEX = new RegExp(/^[^\s;]+@[^\s;]+\.[^\s;]*$/)

function FeedbackForm(this: any) {
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("Submit Feedback");
  const [buttonDisable, setButtonDisable] = useState(false)
  const navigate = useNavigate();


  function sendFeedback() {
    // checks that feedback was entered and that
    // if there is an email entered, it resembles email format.
    if (text.length === 0) {
      alert("Please fill in the feedback text box.")
    } else if ((email.length > 0) && !EMAIL_REGEX.test(email)) {
      alert("Please enter a valid email.");
    } else {
      // Disable button while it is sending the email
      setButtonText("Sending Feedback...");
      setButtonDisable(true);
      // @ts-ignore
      let data = {email_addr:email, message:text}
      //  the send arguments are: service_id, template_id, feedback_info, account_key
      // after the send is complete, then show the result and go back to the main page.
      emailjs.send('service_umass2025', 'template_x0c9ck6', data, 'zhDN63ABiSy7PF_7o')
        .then(() => {
          alert("Feedback message sent");
          navigate("/")
        }, (error) => {
          alert(error.text);
          navigate("/")
        });
    }
  }

  const Plans = (
    <div>
        <h2>Future Plans</h2>
        <ul>
          <li>Automate daily outbreak updates.</li>
          <li>Option to show historic outbreak data (beyond one year ago).</li>
          <li>Ability to Download Data.</li>
          <li>Plot bird data over time for a single location.</li>
          <li>Add marker for today on the timeline.</li>
          <li>Improve accessibility issues.</li>
        </ul> 
    </div>
  );

  return (
    <div className="DefaultPage" style={{marginLeft:50, marginRight:50}}>
        <Link to="/">Return to App</Link>
        {Plans}
        <h2>Feedback</h2>
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
          disabled={buttonDisable}
        >
          {buttonText}
        </Button>

    </div>
  );
}

export default FeedbackForm;
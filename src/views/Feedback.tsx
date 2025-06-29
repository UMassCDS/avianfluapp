import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Textarea, TextInput, Paper, Title, Group, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import emailjs from 'emailjs-com';

import '../styles/Default.css';

const EMAIL_REGEX = new RegExp(/^[^\s;]+@[^\s;]+\.[^\s;]*$/);

/**
 * Renders a feedback form allowing users to submit feedback and optionally provide their email address for a response.
 * 
 * The form includes:
 * - An email input field (optional, validated for email format if provided)
 * - A feedback textarea (required)
 * - A submit button that sends the feedback via emailjs and disables itself while sending
 * - A section listing future plans for the application
 * 
 * On successful submission, the user is notified and redirected to the main page.
 * 
 * @component
 * @returns {JSX.Element} The rendered feedback form component.
 */
function FeedbackForm(this: any) {
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("Submit Feedback");
  const [buttonDisable, setButtonDisable] = useState(false);
  const navigate = useNavigate();


  function sendFeedback() {
    // checks that feedback was entered and that email (if present) is valid
    if (text.length === 0) {
      notifications.show({
        title: 'Feedback Required',
        message: 'Please fill in the feedback text box.',
        color: 'red',
      });
    } else if (email.length > 0 && !EMAIL_REGEX.test(email)) {
      notifications.show({
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        color: 'red',
      });
    } else {
      // Disable button while it is sending the email
      setButtonText('Sending Feedback...');
      setButtonDisable(true);
      const data = { email_addr: email, message: text };
      // the send arguments are: service_id, template_id, feedback_info, account_key
      // after the send is complete, then show the result and go back to the main page.
      emailjs
        .send('service_umass2025', 'template_x0c9ck6', data, 'zhDN63ABiSy7PF_7o')
        .then(() => {
          notifications.show({
            title: 'Feedback Sent',
            message: 'Thank you for your feedback! Redirecting to home...',
            color: 'green',
            autoClose: 3000,
          });

          // Delay navigation by 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        })
        .catch((error) => {
          notifications.show({
            title: 'Sending Failed',
            message: error.text || 'An error occurred while sending feedback.',
            color: 'red',
            autoClose: 6000,
          });

          setTimeout(() => {
            navigate('/');
          }, 6000);
        });
    }
  }

  const Plans = (
    <div style={{ marginBottom: 32 }}>
      <Title order={2} style={{ color: "#1976d2", fontSize: "1.3rem", marginBottom: 10 }}>Future Plans</Title>
      <ul style={{ marginLeft: 20, color: "#444", fontSize: "1.05rem" }}>
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
    <div className="DefaultPage" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          maxWidth: 480,
          margin: "48px auto",
          background: "rgba(255,255,255,0.98)",
          border: "1.5px solid #e3eaf5"
        }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Title order={1} style={{ color: "#1976d2", fontFamily: "Playfair Display, serif", fontWeight: 600, fontSize: "2rem", margin: 0 }}>
            Feedback
          </Title>
          <Link to="/" style={{ color: "#228be6", fontWeight: 500, textDecoration: "none", fontSize: "1rem" }}>
            ← Return to App
          </Link>
        </Group>
        <Divider my="sm" />
        {Plans}
        <form
          onSubmit={e => {
            e.preventDefault();
            sendFeedback();
          }}
        >
          <TextInput
            label="Your email (optional)"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            style={{ marginBottom: 18 }}
            size="md"
            radius="md"
            autoComplete="email"
          />
          <Textarea
            label="Your feedback"
            placeholder="Please provide your feedback here..."
            autosize
            minRows={3}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            style={{ marginBottom: 22 }}
            size="md"
            radius="md"
            required
          />
          <Button
            type="submit"
            rightSection={<IconSend size={16} />}
            disabled={buttonDisable}
            size="md"
            radius="md"
            fullWidth
            style={{
              background: "linear-gradient(90deg, #228be6 60%, #1976d2 100%)",
              fontWeight: 600,
              letterSpacing: 0.5,
              fontSize: "1.08rem"
            }}
          >
            {buttonText}
          </Button>
        </form>
      </Paper>
    </div>
  );
}

export default FeedbackForm;
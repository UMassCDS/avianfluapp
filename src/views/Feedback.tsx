import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import emailjs from 'emailjs-com';

const EMAIL_REGEX = new RegExp(/^[^\s;]+@[^\s;]+\.[^\s;]*$/);

function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("Submit Feedback");
  const [buttonDisable, setButtonDisable] = useState(false);

  function sendFeedback() {
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
      setButtonText('Sending Feedback...');
      setButtonDisable(true);
      const data = { email_addr: email, message: text };
      emailjs
        .send('service_umass2025', 'template_x0c9ck6', data, 'zhDN63ABiSy7PF_7o')
        .then(() => {
          notifications.show({
            title: 'Feedback Sent',
            message: 'Thank you for your feedback!',
            color: 'green',
            autoClose: 3000,
          });
          setButtonText('Submit Feedback');
          setButtonDisable(false);
          setEmail('');
          setText('');
        })
        .catch((error) => {
          notifications.show({
            title: 'Sending Failed',
            message: error.text || 'An error occurred while sending feedback.',
            color: 'red',
            autoClose: 6000,
          });
          setButtonText('Submit Feedback');
          setButtonDisable(false);
        });
    }
  }

  const Plans = (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-blue-500 mb-2">Future Plans</h2>
      <ul className="list-disc ml-6 text-gray-700 text-base space-y-1">
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
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-blue-500 mb-3">Feedback</h2>
      {Plans}
      <form
        onSubmit={e => {
          e.preventDefault();
          sendFeedback();
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
            Your email (optional)
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-blue-200 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="feedback">
            Your feedback
          </label>
          <textarea
            id="feedback"
            className="w-full rounded-md border border-blue-200 px-4 py-2 text-base min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Please provide your feedback here..."
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={buttonDisable}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-md text-lg shadow hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-60"
        >
          {buttonText}
          <IconSend size={18} />
        </button>
      </form>
    </section>
  );
}

export default FeedbackForm;
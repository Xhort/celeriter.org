import random
from datetime import datetime


def get_bot_response(message):
    message = message.lower().strip()

    greetings = [
        "Hello there.",
        "Hey. Humanity built another chatbot. Incredible restraint.",
        "Hi. What can I help with?"
    ]

    jokes = [
        "Why do programmers confuse Halloween and Christmas? Because OCT 31 == DEC 25.",
        "I would tell you a UDP joke, but you might not get it.",
        "Computers are fast because they never stop for emotional damage."
    ]

    if any(word in message for word in ["hello", "hi", "hey"]):
        return random.choice(greetings)

    elif "time" in message:
        return f"The current server time is {datetime.now().strftime('%I:%M %p')}."

    elif "date" in message:
        return f"Today's date is {datetime.now().strftime('%B %d, %Y')}."

    elif "joke" in message:
        return random.choice(jokes)

    elif "your name" in message:
        return "I'm the Celeriter chatbot. A glorified pile of Python functions pretending to be intelligent."

    elif "python" in message:
        return "Python is clean, powerful, and responsible for half the internet pretending semicolons never existed."

    elif "help" in message:
        return (
            "You can ask me about the time, date, programming, or ask for a joke."
        )

    elif "bye" in message:
        return "Goodbye. Try not to break the website on your way out."

    elif message == "":
        return "You sent an empty message. Bold strategy."

    else:
        return (
            f"I heard: '{message}'. "
            "I don't fully understand that yet, but at least the backend works."
        )
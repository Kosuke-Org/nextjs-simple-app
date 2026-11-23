import styles from './page.module.css';

const events = [
  {
    title: 'Design Systems Meetup',
    date: 'Dec 4',
    time: '18:30',
    location: 'Milan',
    category: 'Tech',
    price: 'Free',
  },
  {
    title: 'Sunset Jazz on the Rooftop',
    date: 'Dec 9',
    time: '20:00',
    location: 'Rome',
    category: 'Music',
    price: '€25',
  },
  {
    title: 'Startup Founders Breakfast',
    date: 'Dec 12',
    time: '08:00',
    location: 'Online',
    category: 'Business',
    price: '€10',
  },
];

const steps = [
  {
    title: 'Discover',
    text: 'Browse concerts, meetups and workshops happening near you.',
  },
  {
    title: 'Book',
    text: 'Reserve your spot in a couple of clicks and get your ticket by email.',
  },
  {
    title: 'Show up',
    text: 'Meet people who share your interests and enjoy the event.',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>Gatherly</span>
        <nav className={styles.nav}>
          <a href="#events">Events</a>
          <a href="#how-it-works">How it works</a>
          <a href="#host" className={styles.navButton}>
            Host an event
          </a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Your city, your events</p>
          <h1 className={styles.title}>Find events worth showing up for</h1>
          <p className={styles.subtitle}>
            Gatherly brings together the best concerts, meetups and workshops in
            one place, so you can spend less time searching and more time
            enjoying.
          </p>
          <div className={styles.actions}>
            <a href="#events" className={styles.primaryButton}>
              Explore events
            </a>
            <a href="#host" className={styles.secondaryButton}>
              Host an event
            </a>
          </div>
        </section>

        <section id="events" className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming events</h2>
          <div className={styles.grid}>
            {events.map((event) => (
              <article key={event.title} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.date}>{event.date}</span>
                  <span className={styles.category}>{event.category}</span>
                </div>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <p className={styles.meta}>
                  {event.time} · {event.location}
                </p>
                <p className={styles.price}>{event.price}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className={styles.section}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.grid}>
            {steps.map((step, index) => (
              <div key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.meta}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="host" className={styles.hostBanner}>
          <h2 className={styles.hostTitle}>Organizing something?</h2>
          <p className={styles.hostText}>
            Publish your event on Gatherly and reach people who want to attend.
          </p>
          <a href="#host" className={styles.primaryButtonLight}>
            Host an event
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        © 2026 Gatherly. All rights reserved.
      </footer>
    </div>
  );
}

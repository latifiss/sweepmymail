'use client'

import React, { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // simulate request (replace with API later)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 1000)
  }

  return (
    <main className="contact-page">
      <div className="contact-page__container">

        {/* HEADER */}
        <header className="contact-header">
          <h1 className="contact-header__title">Contact Us</h1>
          <p className="contact-header__subtitle">
            We’re here to help. Send us a message and we’ll respond as soon as possible.
          </p>
        </header>

        {/* CONTENT */}
        <section className="contact-content">

          {/* FORM */}
          <form className="contact-form" onSubmit={handleSubmit}>

            <div className="contact-form__row">
              <div className="contact-form__field">
                <label>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="contact-form__field">
                <label>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="contact-form__field">
              <label>Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                required
              />
            </div>

            <div className="contact-form__field">
              <label>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows={6}
                required
              />
            </div>

            <button className="contact-form__btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            {success && (
              <p className="contact-form__success">
                ✅ Your message has been sent successfully.
              </p>
            )}

          </form>

          {/* INFO SIDE PANEL */}
          <aside className="contact-info">

            <div className="contact-info__card">
              <h3>Email</h3>
              <p>support@magicmail.com</p>
            </div>

            <div className="contact-info__card">
              <h3>Response Time</h3>
              <p>24 – 48 hours</p>
            </div>

            <div className="contact-info__card">
              <h3>Location</h3>
              <p>Accra, Ghana</p>
            </div>

            <div className="contact-info__note">
              We usually reply faster during working hours.
            </div>

          </aside>

        </section>
      </div>
    </main>
  )
}
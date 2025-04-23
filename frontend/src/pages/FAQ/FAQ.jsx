// src/pages/FAQPage/FAQPage.jsx
import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ScrollToTopButton from "../../components/ScrollToTopButton/ScrollToTopButton";
import "./FAQ.css";

const API_URL = "http://localhost:5000";

const FAQItem = ({ question, answer, isOpen, index, toggleOpen }) => {
  const contentRef = useRef(null);

  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => toggleOpen(index)}>
        <span>{question}</span>
        <span className={`faq-icon ${isOpen ? "open" : ""}`}>
          {isOpen ? "-" : "+"}
        </span>
      </div>
      <div
        className="faq-answer-wrapper"
        style={{
          height: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
        }}
      >
        <div className="faq-answer" ref={contentRef}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/faq/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError("Не удалось загрузить FAQ");
          setLoading(false);
          return;
        }

        setFaqs(data);
        setLoading(false);
      } catch (err) {
        setError("Ошибка соединения с сервером");
        console.error("Ошибка:", err);
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <div className="faq-page">
        <div className="faq-container">
          <h1>Часто задаваемые вопросы</h1>

          {loading && (
            <div className="loading-container-1">
              <div className="loading-spinner"></div>
            </div>
          )}

          {error && <div className="error-container">{error}</div>}

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                index={index}
                toggleOpen={toggleOpen}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default FAQPage;

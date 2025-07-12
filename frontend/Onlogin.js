import { useEffect, useRef, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";
import "./Onlogin.css";

// At the top of your file
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [searchQuery, setSearchQuery] = useState("");
const [filterDate, setFilterDate] = useState("");
const [filterVenue, setFilterVenue] = useState("");

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [eventStats, setEventStats] = useState([]);
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    description: "",
    venue: "",
    image: null,
    preview: null,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const registerButtonRef = useRef(null);
  const nameInputRef = useRef(null);
  useEffect(() => {
  if (!user?.access) return;

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/events/my_event_stats/", {
        headers: {
          Authorization: `Bearer ${user.access}`,
        },
      });
      const data = await res.json();
      setEventStats(data);
    } catch (err) {
      console.error("Error fetching event stats:", err);
    }
  };

  fetchStats();
}, [user]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("user");
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!user?.access) return;

    const fetchData = async () => {
      try {
        const [myEvents, allEvents, registered] = await Promise.all([
          fetch("http://localhost:8000/api/events/my_events/", {
            headers: { Authorization: `Bearer ${user.access}` },
          }).then(res => res.json()),
          fetch("http://localhost:8000/api/events/", {
            headers: { Authorization: `Bearer ${user.access}` },
          }).then(res => res.json()),
          fetch("http://localhost:8000/api/registrations/", {
            headers: { Authorization: `Bearer ${user.access}` },
          }).then(res => res.json()),
        ]);

        setCreatedEvents(myEvents);
        setEvents(allEvents);

        const fullRegistered = await Promise.all(
          registered.map((r) =>
            fetch(`http://localhost:8000/api/events/${r.event}/`, {
              headers: { Authorization: `Bearer ${user.access}` },
            }).then((res) => res.json())
          )
        );

        setRegisteredEvents(fullRegistered);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventData((prev) => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (eventData.image instanceof File) {
      formData.append("image", eventData.image);
    }
    formData.append("name", eventData.name);
    formData.append("date", eventData.date);
    formData.append("description", eventData.description);
    formData.append("venue", eventData.venue);
    

    const url = editingIndex !== null
      ? `http://localhost:8000/api/events/${editingIndex}/`
      : "http://localhost:8000/api/events/";

    const method = editingIndex !== null ? "PATCH" : "POST";
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${user.access}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedEvent = await response.json();

        if (editingIndex !== null) {
          setCreatedEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
          );
          setEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
          );
        } else {
          setCreatedEvents((prev) => [...prev, updatedEvent]);
          setEvents((prev) => [...prev, updatedEvent]);
        }

        setEventData({
          name: "",
          date: "",
          description: "",
          venue: "",
          image: null,
          preview: null,
        });
        setEditingIndex(null);
      } else {
        console.error("Error submitting event");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    setEventData({
      name: event.name,
      date: event.date,
      description: event.description,
      venue: event.venue,
      image: null,
      preview: event.image.startsWith("http") ? event.image : `http://localhost:8000${event.image}`,
    });
    setEditingIndex(event.id);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleDelete = async (event) => {
    try {
      await fetch(`http://localhost:8000/api/events/${event.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.access}`,
        },
      });
      setCreatedEvents((prev) => prev.filter((e) => e.id !== event.id));
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setRegisteredEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch("http://localhost:8000/api/registrations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access}`,
        },
        body: JSON.stringify({ event: eventId }),
      });

      if (response.ok) {
        const eventResponse = await fetch(`http://localhost:8000/api/events/${eventId}/`, {
          headers: {
            Authorization: `Bearer ${user.access}`,
          },
        });

        if (eventResponse.ok) {
          const fullEvent = await eventResponse.json();
          setRegisteredEvents([...registeredEvents, fullEvent]);
          setSelectedEvent(null);
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to register:", errorData);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };
const [showFilterPopup, setShowFilterPopup] = useState(false);

  const handleUnregister = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/registrations/unregister/${eventId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.access}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setRegisteredEvents((prev) => prev.filter((e) => e.id !== eventId));
        setSelectedEvent(null);
      } else {
        const errData = await response.json();
        console.error("Failed to unregister", errData);
      }
    } catch (err) {
      console.error("Unregister error:", err);
    }
  };

  const isRegistered = (event) =>
    registeredEvents.some((regEvent) => regEvent.id === event.id);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setTimeout(() => registerButtonRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (selectedEvent) {
      window.scrollTo({ top: window.innerHeight / 20, behavior: "smooth" });
    }
  }, [selectedEvent]);

  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const filteredEvents = sortedEvents.filter(event =>
  event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
  (filterDate ? event.date === filterDate : true) &&
  (filterVenue ? event.venue.toLowerCase().includes(filterVenue.toLowerCase()) : true)
);

function handleDownloadReport(eventId) {
  fetch(`http://localhost:8000/api/events/${eventId}/report/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${user.access}`,
    },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${eventId}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => {
      console.error("Failed to download report:", err);
    });
}


useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/events/my_event_stats/", {
        headers: { Authorization: `Bearer ${user.access}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEventStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  if (user?.access) fetchStats();
}, [user]);

  return (
    <div className="screen">
      <h1 className="head">
        {user ? `${user.username}! 🎉 , Welcome to Event Registration System` : "Loading..."}
      </h1>

      {selectedEvent && <div className="overlay"></div>}

      <div className={`container ${selectedEvent ? "disabled" : ""}`}>
        {selectedEvent && (
          <div className="event-popup">
            <h2>{selectedEvent.name}</h2>
            {selectedEvent?.image && typeof selectedEvent.image === "string" && (
      <img
        src={
          selectedEvent.image.startsWith("http")
            ? selectedEvent.image
            : `http://localhost:8000${selectedEvent.image}`
        }
        alt={selectedEvent.name}
        style={{ width: "100%", maxHeight: "300px", objectFit: "cover", marginBottom: "1rem" }}
      />
    )}
            <p><strong>Date:</strong> {selectedEvent.date}</p>
            <p><strong>Venue:</strong> {selectedEvent.venue}</p>
            <p>{selectedEvent.description}</p>
            {isRegistered(selectedEvent) ? (
              <>
                <button className="register-btn" disabled>Registered</button>
                <button className="unregister-btn" onClick={() => handleUnregister(selectedEvent.id)}>Unregister</button>
              </>
            ) : (
              <button ref={registerButtonRef} className="register-btn" onClick={() => handleRegister(selectedEvent.id)}>Register</button>
            )}
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        )}

        <div className="left">
          <div className="create">
            <h2>{editingIndex !== null ? "Edit Event" : "Create Event"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Event Name" value={eventData.name} onChange={handleChange} required ref={nameInputRef} />
              <input type="date" name="date" min={getTomorrowDate()} value={eventData.date} onChange={handleChange} required />
              <textarea name="description" placeholder="Event Description" value={eventData.description} onChange={handleChange} required></textarea>
              <input type="text" name="venue" placeholder="Event Venue" value={eventData.venue} onChange={handleChange} required />
              {eventData.preview && (
                <div>
                  <p className="curr">Current Poster:</p>
                  <img src={eventData.preview} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                </div>
              )}
              <label>Poster:
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit">{editingIndex !== null ? "Update Event" : "Add Event"}</button>
                {editingIndex !== null && (
                  <button type="button" className="cancel-btn" onClick={() => {
                    setEditingIndex(null);
                    setEventData({ name: "", date: "", description: "", venue: "", image: null, preview: null });
                  }}>Cancel Edit</button>
                )}
              </div>
            </form>
          </div>

          <div className="your-events">
            <h2>Your Created Events</h2>
            {createdEvents.length === 0 ? <p>No events created yet</p> : null}
            <div className="created-events-grid">
              {createdEvents.map((event, index) => (
                <div key={event.id} className="event-card-small">
                  <h3>{event.name}</h3>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
                  <p>{event.description.length > 50 ? event.description.substring(0, 50) + "..." : event.description}</p>
                  <div className="event-actions">
                    <button onClick={() => handleEdit(event)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(event)} className="delete-btn">Delete</button>
                    <button onClick={() => handleDownloadReport(event.id)}>Download Report</button>
                  </div>
                </div>
              ))}
            </div>
             <div className="dashboard">
    <h2>📊 Dashboard: Event Registrations</h2>
    <Bar
    key={JSON.stringify(eventStats)} 
      data={{
        labels: eventStats.map(e => e.event_name),
        datasets: [{
          label: "Registrations",
          data: eventStats.map(e => e.registrations),
          backgroundColor: 'rgba(75,192,192,0.6)',
          borderRadius: 5
        }]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }}
    />
  </div>

          </div>

          <div className="registered-events">
            <h2>Registered Events</h2>
            {registeredEvents.length === 0 ? <p>No registered events</p> : null}
            <div className="created-events-grid">
              {registeredEvents.map((event, index) => (
                <div key={event.id} className="event-card-small">
                  <h3>{event.name}</h3>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
                  <button className="unregister-btn" onClick={() => handleUnregister(event.id)}>Unregister</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right">
          
          <div className="upcoming">
            {/* Search and Filter UI */}
<div className="search-filter">
  <input
    type="text"
    placeholder="Search events by name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <button onClick={() => setShowFilterPopup(!showFilterPopup)}>Filter 🔍</button>
</div>

{showFilterPopup && (
  <div className="filter-popup">
    <label>
      Date:
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
    </label>
    <label>
      Venue:
      <input
        type="text"
        placeholder="Enter venue..."
        value={filterVenue}
        onChange={(e) => setFilterVenue(e.target.value)}
      />
    </label>
    <div className="filter-actions">
      <button onClick={() => {
        setFilterDate("");
        setFilterVenue("");
        setShowFilterPopup(false);
      }}>Clear</button>
      <button onClick={() => setShowFilterPopup(false)}>Apply</button>
    </div>
  </div>
)}


            <h2 className="up">Upcoming Events</h2>
            {sortedEvents.length === 0 ? <p>No upcoming events</p> : null}
            <div>
              {filteredEvents.map((event, index) => (

                <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
                  {event.image && (
  <img src={event.image} alt={event.name} style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} />
)}

                  <h3>{event.name}</h3>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
                  <p>{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="logdiv">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default App;

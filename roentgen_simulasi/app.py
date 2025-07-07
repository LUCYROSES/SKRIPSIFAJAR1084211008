import streamlit as st
import requests, json
import time

BACKEND = "http://localhost:8000"   

# --------------------------
# halaman Streamlit
# --------------------------
st.set_page_config(
    page_title="Panel Kontrol Simulasi Pesawat Roentgen",
    layout="wide",
)

st.title("Panel Kontrol Simulasi Pesawat Roentgen")

col1, col2 = st.columns([1, 3])

# Di awal file, sebelum layout
if "auto_status" not in st.session_state:
    st.session_state.auto_status = "OFF"

# Polling status dari backend setiap 1 detik
def poll_status():
    try:
        resp = requests.get(f"{BACKEND}/status", timeout=0.2)
        kode_backend = resp.json().get("kode", "x")
        if kode_backend == "e":
            st.session_state.auto_status = "ON"
        elif kode_backend == "p":
            st.session_state.auto_status = "PRE"
        else:
            st.session_state.auto_status = "OFF"
    except:
        st.session_state.auto_status = "OFF"

poll_status()
time.sleep(1)  # agar tidak terlalu sering

with col1:
    st.subheader("Parameter Kontrol")
    kv  = st.slider("Tegangan (kV)", 40, 120, 80)
    ma  = st.slider("Arus (mA)",     50, 300, 100)
    sec = st.slider("Waktu (detik)", 1,  10,  2)

    st.subheader("Kontrol Paparan")
    kode = st.radio("Status", ["OFF", "PRE", "ON"], horizontal=True, index=["OFF", "PRE", "ON"].index(st.session_state.auto_status))

 
    payload = {
        "kv": kv,
        "mA": ma,
        "Sec": sec,
        "kode": "e" if kode == "ON" else "p" if kode == "PRE" else "x"
    }

    if payload != st.session_state.get("sent_payload"):
        try:
            requests.post(f"{BACKEND}/update", json=payload, timeout=0.2)
            st.session_state.sent_payload = payload
        except requests.exceptions.RequestException:
            st.warning("⚠️ Flask server belum aktif di port 8000")

    st.markdown("---")
    st.markdown(f"""
    **Tegangan:** {kv} kV  
    **Arus:** {ma} mA  
    **Waktu:** {sec} detik  
    **Status:** {kode}
    """)

with col2:
    st.subheader("Simulasi Pesawat Roentgen")
    st.markdown(f"""
    <iframe src="{BACKEND}/web/index.html"
            width="100%" height="800" frameborder="0"
            style="background:#000;"></iframe>
    """, unsafe_allow_html=True)

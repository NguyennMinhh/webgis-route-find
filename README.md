# 🚌 Bus Map

A **WebGIS application** for visualizing and finding optimal public bus routes on an interactive map.
Built with **Django (backend)** and **React + Leaflet (frontend)**, integrated with **PostGIS** for spatial data storage.

---

## 🧩 Project Structure

```
webgis-route-find/
│
├── backend/                 # Django backend (API, routing, data models)
│   ├── manage.py
│   ├── settings.py
│   ├── apps/
│   └── ...
│
├── frontend/                # React + Leaflet frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── data/                    # CSV / GeoJSON map data
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## ⚙️ Backend Setup (Django + GeoDjango)

### 1️⃣ Install QGIS (for GDAL / GEOS / PROJ support)

If you are using **Windows**, QGIS already includes everything needed for GeoDjango.

**Steps:**

1. Download and install QGIS from
   👉 [https://qgis.org/en/site/forusers/download.html](https://qgis.org/en/site/forusers/download.html)

2. Locate these paths (adjust version numbers if different):

   ```
   C:\Program Files\QGIS 3.44.2\bin
   C:\Program Files\QGIS 3.44.2\share\gdal
   C:\Program Files\QGIS 3.44.2\share\proj
   ```

3. Add the following **at the top of your `backend/settings.py`** (before `from pathlib import Path`):

   ```python
   import os

   os.environ['PROJ_LIB'] = r"C:\Program Files\QGIS 3.44.2\share\proj"
   os.environ['GDAL_DATA'] = r"C:\Program Files\QGIS 3.44.2\share\gdal"

   # Link QGIS DLLs for GeoDjango
   GDAL_LIBRARY_PATH = r"C:\Program Files\QGIS 3.44.2\bin\gdal311.dll"
   GEOS_LIBRARY_PATH = r"C:\Program Files\QGIS 3.44.2\bin\geos_c.dll"
   ```

4. Verify installation:

   ```bash
   gdalinfo --version
   ```

   Example output:

   ```
   GDAL 3.4.1, released 2021/12/27
   ```

---

### 2️⃣ Setup PostgreSQL + PostGIS

1. Install **PostgreSQL** and **PostGIS extension**.
   👉 [https://postgis.net/windows_downloads/](https://postgis.net/windows_downloads/)

2. Create a new database:

   ```sql
   CREATE DATABASE busmap;
   ```

3. Enable PostGIS:

   ```sql
   \c busmap
   CREATE EXTENSION postgis;
   ```

4. Update your `backend/settings.py`:

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.contrib.gis.db.backends.postgis',
           'NAME': 'busmap',
           'USER': 'postgres',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

---

### 3️⃣ Create and activate virtual environment

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

---

### 4️⃣ Install dependencies

```bash
pip install -r backend/requirements.txt
```

**Make sure your `requirements.txt` includes:**

```
Django
djangorestframework
django-cors-headers
psycopg2
django.contrib.gis
```

---

### 5️⃣ Run migrations and start the backend server

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

Backend API available at:
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 💻 Frontend Setup (React + Leaflet)

1. Navigate to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

Frontend runs on:
**[http://localhost:3000](http://localhost:3000)**

---

## 🌐 Notes

* The backend and frontend must both be running for full functionality.
* Use [`django-cors-headers`](https://pypi.org/project/django-cors-headers/) to allow cross-origin requests.
* Leaflet renders **OpenStreetMap** tiles and draws bus routes using **Polyline**.
* Geometry data is stored in **WKT (POINT / LINESTRING)** format.

---

## 🧠 Environment Summary

| Component          | Technology                   |
| ------------------ | ---------------------------- |
| **Backend**        | Django + GeoDjango           |
| **Frontend**       | React + Leaflet              |
| **Database**       | PostgreSQL + PostGIS         |
| **GIS Libraries**  | GDAL, GEOS, PROJ (from QGIS) |
| **Map Data**       | OpenStreetMap                |
| **Routing Engine** | OSRM API                     |
| **Data Format**    | WKT / GeoJSON                |

---

## 🚀 Features

* Interactive bus route map visualization
* Show and filter bus stations and routes
* Parse and display geometry (POINT, LINESTRING)
* Real-time user location tracking
* Route direction styling (go / return)
* Integration with OSRM for route optimization
* Uses PostGIS for spatial queries and storage

---

## ✅ GIS Verification Test

Run in Django shell:

```bash
python manage.py shell
```

Then:

```python
from django.contrib.gis.gdal import HAS_GDAL
from django.contrib.gis.geos import GEOSGeometry
print(HAS_GDAL)  # Should print True

point = GEOSGeometry('POINT(105.83 21.02)')
print(point.x, point.y)
```

If both work → GeoDjango and QGIS environment are correctly linked.

---

## 📸 Example Screenshot

*(Add your own screenshot later)*

```markdown
![Bus Map Demo](docs/screenshot.png)
```

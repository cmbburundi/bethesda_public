document.addEventListener('DOMContentLoaded', () => {
    // Check if map container exists
    if (!document.getElementById('map')) return;

    // Provided Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY21iZXRoZXNkYSIsImEiOiJjbW0zOHR2Z2EwMWFwMnFzZjA1OHE5bDAyIn0.zZvJmyp1STfg5IzwcEXwmg';

    // Gare du Nord Bujumbura (-3.354220, 29.383414) -> [lng, lat]
    const startCoord = [29.383414, -3.354220];
    // Centre Médical Bethesda (from 3°21'10.9"S 29°23'21.8"E)
    const endCoord = [29.389389, -3.353028];

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [29.3856, -3.3512], // Approximate center of route
        zoom: 14.5,
        pitch: 45, // Adding pitch for a slight 3D perspective
    });

    // Adding navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Fetch route using Mapbox Directions API
    async function getRoute(start, end) {
        try {
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            if (!json.routes || json.routes.length === 0) return null;
            return json.routes[0].geometry;
        } catch (e) {
            console.error('Error fetching route:', e);
            return null;
        }
    }

    map.on('load', async () => {
        // Add styles for the marker badges
        const style = document.createElement('style');
        style.innerHTML = `
      .mapbox-custom-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
      }
      .marker-badge {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
        margin-bottom: 6px;
        position: relative;
      }
      .start-marker .marker-badge {
        background: #4b5563;
        color: white;
      }
      .end-marker .marker-badge {
        background: #E9A115;
        color: #1a0a00;
      }
      .marker-badge::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
      }
      .start-marker .marker-badge::after {
        border-color: #4b5563 transparent transparent transparent;
      }
      .end-marker .marker-badge::after {
        border-color: #E9A115 transparent transparent transparent;
      }
      .marker-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      .start-marker .marker-dot {
        background: #4b5563;
      }
      .end-marker .marker-dot {
        background: #E9A115;
      }
      .other-marker .marker-badge {
        font-size: 10px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.95);
        color: #374151;
        border: 1px solid rgba(0,0,0,0.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .other-marker .marker-badge::after {
        border-color: rgba(255, 255, 255, 0.95) transparent transparent transparent;
      }
      .other-marker .marker-dot {
        background: #9ca3af;
        width: 10px;
        height: 10px;
        border-width: 1.5px;
      }
    `;
        document.head.appendChild(style);

        // Add additional reference locations
        const coordBancobu = [29.38662165754543, -3.3526474474363654];
        const coordHopital = [29.385393357971484, -3.356516996693967];

        const elBancobu = document.createElement('div');
        elBancobu.className = 'mapbox-custom-marker other-marker';
        elBancobu.innerHTML = '<div class="marker-badge">BANCOBU - GARE DU NORD</div><div class="marker-dot"></div>';
        new mapboxgl.Marker({ element: elBancobu, anchor: 'bottom', offset: [0, 5] })
            .setLngLat(coordBancobu)
            .addTo(map);

        const elHopital = document.createElement('div');
        elHopital.className = 'mapbox-custom-marker other-marker';
        elHopital.innerHTML = '<div class="marker-badge">Hôpital Roi-Khaled</div><div class="marker-dot"></div>';
        new mapboxgl.Marker({ element: elHopital, anchor: 'bottom', offset: [0, 5] })
            .setLngLat(coordHopital)
            .addTo(map);

        // Create Start Badge (Gare du Nord)
        const elStart = document.createElement('div');
        elStart.className = 'mapbox-custom-marker start-marker';
        elStart.innerHTML = '<div class="marker-badge">GARE DU NORD</div><div class="marker-dot"></div>';

        new mapboxgl.Marker({ element: elStart, anchor: 'bottom', offset: [0, 7] })
            .setLngLat(startCoord)
            .addTo(map);

        // Create Destination Badge (Centre Médical Bethesda)
        const elEnd = document.createElement('div');
        elEnd.className = 'mapbox-custom-marker end-marker';
        elEnd.innerHTML = '<div class="marker-badge">Centre Medical BETHESDA</div><div class="marker-dot"></div>';

        new mapboxgl.Marker({ element: elEnd, anchor: 'bottom', offset: [0, 7] })
            .setLngLat(endCoord)
            .addTo(map);

        const routeGeometry = await getRoute(startCoord, endCoord);
        if (!routeGeometry) return;

        // Fit map bounds to show both start and end locations
        const bounds = new mapboxgl.LngLatBounds(startCoord, startCoord);
        bounds.extend(endCoord);
        map.fitBounds(bounds, { padding: 50, pitch: 45 });

        // Wait until turf is available (loaded via CDN parameter or index script tags)
        if (typeof turf === 'undefined') {
            console.warn('Turf.js is required for animation but not found on window.');
            return;
        }

        // Add the route line
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
            }
        });

        map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#2D6A4F',
                'line-width': 5,
                'line-opacity': 0.6
            }
        });

        // Add the animated point source
        const pointSourceId = 'animated-point';
        map.addSource(pointSourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: startCoord
                }
            }
        });

        // Add the animated point layer
        map.addLayer({
            id: 'point-layer',
            type: 'circle',
            source: pointSourceId,
            paint: {
                'circle-radius': 8,
                'circle-color': '#1B4332',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-pitch-alignment': 'map'
            }
        });

        // Animation variables
        const routeDistance = turf.length(routeGeometry, { units: 'kilometers' });
        const steps = 600; // Total animation frames (approx 10 seconds at 60fps)
        let counter = 0;
        let animationId = null;

        function animate() {
            // Calculate current distance
            const currentDistance = (counter / steps) * routeDistance;

            // Calculate coordinates along the route at current distance
            const point = turf.along(routeGeometry, currentDistance, { units: 'kilometers' });

            // Update data
            map.getSource(pointSourceId).setData(point);

            // Smoothly pan map to follow the point
            map.easeTo({
                center: point.geometry.coordinates,
                duration: 0, // 0 for continuous update
                essential: true
            });

            if (counter < steps) {
                animationId = requestAnimationFrame(animate);
            } else {
                // Finished route, pause then restart
                setTimeout(() => {
                    counter = 0;
                    animate();
                }, 2000);
            }
            counter += 1;
        }

        // Start animating
        setTimeout(() => {
            animate();
        }, 1000); // 1s initial delay
    });
});

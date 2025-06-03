import React, { useState, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const TravelPlanner = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({ lat: 32.0853, lng: 34.7818 });
  const [zoom, setZoom] = useState(10);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  const mapRef = useRef();
  const fileInputRef = useRef();

  // חיפוש מקומות עם Google Places
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapRef.current) return;
    
    setLoading(true);
    try {
      const service = new google.maps.places.PlacesService(mapRef.current);
      
      const request = {
        query: searchQuery,
        fields: ['name', 'geometry', 'formatted_address', 'photos']
      };
      
      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const place = results[0];
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          setCenter(newCenter);
          setZoom(15);
          
          const newMarker = {
            id: `search_${Date.now()}`,
            position: newCenter,
            title: place.name,
            description: place.formatted_address,
            type: 'search'
          };
          
          setMarkers(prev => [...prev, newMarker]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('שגיאה בחיפוש:', error);
      setLoading(false);
    }
  }, [searchQuery]);

  // יצירת מסלול אוטומטי עם AI (סימולציה)
  const handleAiGeneration = async () => {
    setLoading(true);
    try {
      // סימולציה של קריאה ל-AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions = [
        { lat: 32.0853, lng: 34.7818, title: 'תל אביב - רחוב רוטשילד', type: 'ai' },
        { lat: 32.0644, lng: 34.7749, title: 'שוק נחלת בנימין', type: 'ai' },
        { lat: 32.0532, lng: 34.7691, title: 'נמל תל אביב', type: 'ai' },
        { lat: 32.0739, lng: 34.7865, title: 'פארק הירקון', type: 'ai' }
      ];
      
      const aiMarkers = suggestions.map((place, index) => ({
        id: `ai_${index}`,
        position: { lat: place.lat, lng: place.lng },
        title: place.title,
        description: 'הומלץ על ידי AI',
        type: place.type
      }));
      
      setMarkers(prev => [...prev, ...aiMarkers]);
      setAiSuggestions(['תכנון מסלול יומי', 'המלצות מסעדות', 'אטרקציות מומלצות']);
    } catch (error) {
      console.error('שגיאה ביצירת מסלול:', error);
    } finally {
      setLoading(false);
    }
  };

  // העלאת קובץ GPX
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.target.result, 'text/xml');
        const waypoints = Array.from(xmlDoc.getElementsByTagName('wpt'));
        
        const gpxMarkers = waypoints.map((point, index) => {
          const lat = parseFloat(point.getAttribute('lat'));
          const lng = parseFloat(point.getAttribute('lon'));
          const name = point.getElementsByTagName('name')[0]?.textContent || `נקודה ${index + 1}`;
          
          return {
            id: `gpx_${index}`,
            position: { lat, lng },
            title: name,
            description: 'מקובץ GPX',
            type: 'gpx'
          };
        });
        
        setMarkers(prev => [...prev, ...gpxMarkers]);
        
        if (gpxMarkers.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          gpxMarkers.forEach(marker => {
            bounds.extend(marker.position);
          });
          mapRef.current?.fitBounds(bounds);
        }
      } catch (error) {
        console.error('שגיאה בטעינת קובץ GPX:', error);
      }
    };
    
    reader.readAsText(file);
  };

  // הוספת נקודה בלחיצה על המפה
  const handleMapClick = useCallback((event) => {
    if (event.latLng) {
      const newMarker = {
        id: `manual_${Date.now()}`,
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        },
        title: `נקודה ${markers.length + 1}`,
        description: 'נוסף ידנית',
        type: 'manual'
      };
      
      setMarkers(prev => [...prev, newMarker]);
    }
  }, [markers.length]);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh', 
      direction: 'rtl',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2
    }}>
      {/* פאנל בקרה עליון */}
      <Paper elevation={8} sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 4,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textAlign: 'center',
          mb: 3
        }}>
          🗺️ מתכנן נסיעות חכם
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש מקום או אטרקציה..."
              variant="outlined"
              size="small"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    size="small"
                    variant="contained"
                    sx={{ 
                      borderRadius: '50px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)'
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  </Button>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleAiGeneration}
              disabled={loading}
              sx={{
                borderRadius: '25px',
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                }
              }}
            >
              {loading ? 'יוצר מסלול...' : 'צור מסלול עם AI'}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx,.kml"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderRadius: '25px',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              טען קובץ GPX
            </Button>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                📍 {markers.length} נקודות
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* המלצות AI */}
        {aiSuggestions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 הצעות חכמות:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {aiSuggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* המפה */}
      <Paper elevation={8} sx={{ 
        height: 'calc(100vh - 220px)', 
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <APIProvider apiKey={process.env.REACT_APP_GMAPS_API_KEY}>
          <Map
            mapId={process.env.REACT_APP_MAP_ID}
            center={center}
            zoom={zoom}
            onClick={handleMapClick}
            style={{ 
              width: '100%', 
              height: '100%'
            }}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            streetViewControl={false}
            mapTypeControl={false}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {markers.map((marker) => (
              <AdvancedMarker
                key={marker.id}
                position={marker.position}
                onClick={() => setSelectedMarker(marker.id)}
              >
                <Pin
                  background={
                    marker.type === 'ai' ? '#ff6b6b' :
                    marker.type === 'search' ? '#667eea' :
                    marker.type === 'gpx' ? '#4ecdc4' : '#45b7d1'
                  }
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={1.2}
                />
              </AdvancedMarker>
            ))}
            
            {selectedMarker && (
              <InfoWindow
                position={markers.find(m => m.id === selectedMarker)?.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <Card sx={{ minWidth: 200, direction: 'rtl' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {markers.find(m => m.id === selectedMarker)?.title}
                    </Typography>
                    {markers.find(m => m.id === selectedMarker)?.description && (
                      <Typography variant="body2" color="text.secondary">
                        {markers.find(m => m.id === selectedMarker)?.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </Paper>
    </Box>
  );
};

export default TravelPlanner;

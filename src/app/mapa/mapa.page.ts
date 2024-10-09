import { Component, ViewChild, ElementRef } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage {
  @ViewChild('map', { static: false })
  mapElement!: ElementRef;
  map: any;
  marker: any;
  userLocation: any;

  constructor() {}

  // Inicializar el mapa y obtener la ubicación
  async ionViewDidEnter() {
    const position = await this.getCurrentPosition();
    this.userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
    const mapOptions = {
      center: this.userLocation,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // Marcar la ubicación del usuario
    new google.maps.Marker({
      position: this.userLocation,
      map: this.map,
      title: 'Ubicación actual'
    });

    // Añadir evento para marcar otro punto en el mapa y trazar la ruta
    this.map.addListener('click', (event: any) => {
      this.addMarker(event.latLng);
      this.calculateDistance(event.latLng);
      this.drawRoute(event.latLng);  // Llamar a la función para trazar la ruta
    });
  }

  // Obtener la ubicación actual del usuario
  async getCurrentPosition(): Promise<any> {
    const coordinates = await Geolocation.getCurrentPosition();
    return coordinates;
  }

  // Añadir marcador en el mapa
  addMarker(location: any) {
    if (this.marker) {
      this.marker.setMap(null); // Remover el marcador anterior
    }
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'Punto marcado'
    });
  }

  // Calcular la distancia entre la ubicación actual y el punto marcado
  calculateDistance(destination: any) {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [this.userLocation],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          const distance = response.rows[0].elements[0].distance.text;
          alert(`Distancia: ${distance}`);
        }
      }
    );
  }

  // Añadir la función para trazar una ruta
  drawRoute(destination: any) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);

    const request = {
      origin: this.userLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        alert('Error al calcular la ruta: ' + status);
      }
    });
  }
}

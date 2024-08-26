const TOTAL_SPACES = 72; // Total de espacios basado en la cantidad real de espacios
const MAP_LAYOUT = [
    null,      null,      null,      'entrada',  null,      null,      null,
    'pasillo', 'pasillo', 'pasillo', 'pasillo', 'pasillo', 'pasillo', 'pasillo',
    'space',   'pasillo', 'space',   'pasillo', 'space',   'pasillo', 'space',
    'space',   'pasillo', 'space',   'pasillo', 'space',   'pasillo', 'space',
    'space',   'pasillo', 'space',   'pasillo', 'space',   'pasillo', 'space',
    'space',   'pasillo', 'space',   'pasillo', 'space',   'pasillo', 'space',
    'space',   'pasillo', 'space',   'pasillo', 'space',   'pasillo', 'space',
    'space',   'pasillo', 'space',   'pasillo', 'space',   'pasillo', 'space',
];

const HOURLY_RATE = 50; // Tarifa fija por hora
let parkingSpaces = JSON.parse(localStorage.getItem('parkingSpaces')) || Array(TOTAL_SPACES).fill(null);

document.addEventListener('DOMContentLoaded', () => {
    renderParkingMap();
    
    document.getElementById('parkCarButton').addEventListener('click', parkCar);
    document.getElementById('leaveParkingButton').addEventListener('click', leaveParking);
    document.getElementById('resetButton').addEventListener('click', resetParking);
});

function renderParkingMap() {
    const parkingMap = document.getElementById('parkingMap');
    parkingMap.innerHTML = '';

    let spaceNumber = 1; // Contador para los números de los espacios
    let spaceMapping = {}; // Mapeo de spaceNumber a index

    MAP_LAYOUT.forEach((layoutType, index) => {
        if (layoutType) {
            const space = document.createElement('div');

            if (layoutType === 'space') {
                spaceMapping[spaceNumber] = index; // Guardar el mapeo

                if (parkingSpaces[index]?.occupied) {
                    space.className = 'parking-space occupied';
                    space.textContent = parkingSpaces[index].licensePlate;
                } else {
                    space.className = 'parking-space available';
                    space.textContent = `Espacio ${spaceNumber}`;
                }
                spaceNumber++; // Incrementa el número de espacio solo para 'space'
            } else if (layoutType === 'pasillo') {
                space.className = 'parking-space pasillo';
            } else if (layoutType === 'entrada') {
                space.className = 'parking-space entrada';
                space.textContent = 'Entrada';
            }

            parkingMap.appendChild(space);
        } else {
            const emptySpace = document.createElement('div');
            emptySpace.className = 'empty-space';
            parkingMap.appendChild(emptySpace);
        }
    });

    localStorage.setItem('parkingSpaces', JSON.stringify(parkingSpaces));
    localStorage.setItem('spaceMapping', JSON.stringify(spaceMapping)); // Guardar el mapeo en localStorage
}

function getRandomAvailableSpace() {
    let availableSpaces = [];

    let spaceMapping = JSON.parse(localStorage.getItem('spaceMapping')); // Recuperar el mapeo

    for (let spaceNumber in spaceMapping) {
        let index = spaceMapping[spaceNumber];
        if (!parkingSpaces[index]?.occupied) {
            availableSpaces.push(parseInt(spaceNumber));
        }
    }

    if (availableSpaces.length === 0) {
        return null;
    }

    return spaceMapping[availableSpaces[Math.floor(Math.random() * availableSpaces.length)]];
}

function parkCar() {
    let spaceIndex = getRandomAvailableSpace();

    if (spaceIndex === null) {
        alert('No hay espacios disponibles.');
        return;
    }

    let licensePlate = prompt("Ingrese la patente del vehículo:");

    if (licensePlate) {
        parkingSpaces[spaceIndex] = {
            occupied: true,
            licensePlate: licensePlate,
            startTime: new Date().getTime()
        };

        // Obtener el número de espacio que se muestra al usuario
        let spaceMapping = JSON.parse(localStorage.getItem('spaceMapping'));
        let spaceNumber = Object.keys(spaceMapping).find(key => spaceMapping[key] == spaceIndex);

        alert(`Se le asigno el espacio ${spaceNumber}.`);
        renderParkingMap();
    }
}

function leaveParking() {
    let licensePlate = prompt('Introduce la patente del vehículo que se va a liberar:');
    let spaceIndex = parkingSpaces.findIndex(space => space?.licensePlate === licensePlate);

    if (spaceIndex === -1 || !parkingSpaces[spaceIndex]?.occupied) {
        alert('Patente inválida o el espacio ya está libre.');
        return;
    }

    let endTime = new Date().getTime();
    let durationInMs = endTime - parkingSpaces[spaceIndex].startTime;
    let durationInHours = durationInMs / (1000 * 60 * 60);
    let totalAmount = Math.ceil(durationInHours) * HOURLY_RATE;

    // Obtener el número de espacio que se muestra al usuario
    let spaceMapping = JSON.parse(localStorage.getItem('spaceMapping'));
    let spaceNumber = Object.keys(spaceMapping).find(key => spaceMapping[key] == spaceIndex);

    if (confirm(`¿Desea liberar el espacio ? El monto a cobrar es $${totalAmount}. Diríjase al espacio ${spaceNumber} para retirar su vehículo.`)) {
        parkingSpaces[spaceIndex] = null;
        renderParkingMap();
    }
}

function resetParking() {
    if (confirm('¿Está seguro de que desea reiniciar todos los espacios?')) {
        parkingSpaces = Array(TOTAL_SPACES).fill(null);
        renderParkingMap();
    }
}

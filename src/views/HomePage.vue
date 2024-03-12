<template>
    <div>
        <div v-if="serverStatusMessage" class="alert alert-danger">
            {{ serverStatusMessage }}
        </div>

        <div v-if="!showCarsList && !showRegistrationForm && !showWithdrawForm && !showUpdateLicensePlateFormView && !showUpdateForm"
            class="welcome-menu">
            <h2>Welcome to the Parking System</h2>
            <div class="menu-options">
                <button @click="showRegisterForm">Register Car</button>
                <button @click="listCars">List Cars</button>
                <button @click="showUpdateLicensePlateForm">Update Car</button>
                <button @click="showWithdrawCarForm">Withdraw Car</button>
            </div>

            <div v-if="withdrawAlertMessageA" class="alert alert-info mt-3">
                {{ withdrawAlertMessageA }}
            </div>
        </div>

        <div v-if="showRegistrationForm" class="withdraw-form">
            <h2>Register a Car</h2>
            <form @submit.prevent="registerCar">
                <input type="text" v-model="car.licensePlate" placeholder="License Plate" required>
                <div class="form-group">
                    <label for="carColor">Color:</label>
                    <input type="color" id="carColor" v-model="car.color" required>
                </div>
                <input type="file" @change="handleFileUpload">
                <div class="button-group">
                    <button type="submit">Submit</button>
                    <button type="button" @click="showMenu">Back to Menu</button>
                </div>
            </form>

            <div v-if="alertMessage" class="alert" :class="{ 'alert-success': success, 'alert-danger': !success }">
                {{ alertMessage }}
            </div>
        </div>

        <div v-if="showCarsList" class="car-list-container">
            <h2 class="car-list-title">List of Registered Cars</h2>
            <div v-for="car in cars" :key="car.licensePlate" class="car-item">
                <img :src="`http://${this.load_balancer_url}/uploads/${car.imagePath}`" alt="Car photo"
                    class="car-image" />
                <div class="car-details">
                    <p><strong>Plate:</strong> {{ car.licensePlate }}</p>
                    <p><strong>Color:</strong> {{ car.color }}</p>
                    <p><strong>Entry Time:</strong> {{ new Date(car.entryTime).toLocaleString() }}</p>
                </div>
            </div>
            <button class="back-to-menu-btn" @click="showMenuB">Back to Menu</button>
        </div>

        <div v-if="noCarsRegistered && showCarsList" class="alert alert-info">
            <p>No cars have been registered yet.</p>
        </div>

        <div v-if="showUpdateLicensePlateFormView" class="registration-form">
            <h2>Enter License Plate of Car to Update</h2>
            <form @submit.prevent="verifyCarExists">
                <input type="text" v-model="updateLicensePlate" placeholder="License Plate" required>
                <div class="button-group">
                    <button type="submit">Verify</button>
                    <button type="button" @click="showMenuD">Back to Menu</button>
                </div>
            </form>

            <div v-if="updateAlertMessage" class="alert"
                :class="{ 'alert-success': success, 'alert-danger': !success }">
                {{ updateAlertMessage }}
            </div>
        </div>


        <div v-if="showUpdateForm" class="registration-form">
            <h2>Update a Car</h2>
            <form @submit.prevent="updateCar">
                <input type="text" v-model="updateLicensePlate" placeholder="License Plate" required>
                <div class="form-group">
                    <label for="updateCarColor">Color:</label>
                    <input type="color" id="updateCarColor" v-model="carToUpdate.color">
                </div>
                <input type="file" @change="handleUpdateFileUpload">
                <div class="button-group">
                    <button type="submit">Update</button>
                    <button type="button" @click="showMenuD">Back to Menu</button>
                </div>
            </form>

            <div v-if="withdrawAlertMessageB" class="alert"
                :class="{ 'alert-success': success, 'alert-danger': !success }">
                {{ withdrawAlertMessageB }}
            </div>
        </div>

        <div v-if="showWithdrawForm" class="registration-form">
            <h2>Withdraw a Car</h2>
            <form @submit.prevent="withdrawCar">
                <input type="text" v-model="withdrawLicensePlate" placeholder="License Plate" required>
                <div class="button-group">
                    <button type="submit">Withdraw</button>
                    <button type="button" @click="showMenuC">Back to Menu</button>
                </div>
            </form>

            <div v-if="withdrawAlertMessageB" class="alert"
                :class="{ 'alert-success': success, 'alert-danger': !success }">
                {{ withdrawAlertMessageB }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HomePage',
    data() {
        return {
            load_balancer_url: '',
            serverOnline: true,
            errorMessage: '',
            successMessage: '',
            selectedFileName: '',
            car: {
                licensePlate: '',
                color: '',
                photo: null,
                entryTime: ''
            },
            showRegistrationForm: false,
            alertMessage: '',
            success: true,
            cars: [],
            showCarsList: false,
            noCarsRegistered: false,
            withdrawLicensePlate: '',
            showWithdrawForm: false,
            withdrawAlertMessageA: '',
            withdrawAlertMessageB: '',
            serverStatusMessage: '',
            showUpdateLicensePlateFormView: false,
            showUpdateForm: false,
            updateLicensePlate: '',
            carToUpdate: {
                licensePlate: '',
                color: '',
                photo: null
            },
            updateAlertMessage: '',
        };
    },
    methods: {
        updateServerStatus(online, message) {
            this.serverOnline = online;
            this.serverStatusMessage = message;
        },

        checkServerStatus() {
            return fetch('/config.json')
                .then((response) =>
                    response.json())
                .then((config) => {
                    this.load_balancer_url = config.loadBalancerUrl;
                })
                .catch((error) => {
                    console.error('Cannot load the configuration: ', error)
                });
        },

        registerCar() {
            this.alertMessage = '';
            this.selectedFileName = '';

            const formData = new FormData();
            formData.append('license_plate', this.car.licensePlate);
            formData.append('color', this.car.color);

            fetch(`http://${this.load_balancer_url}/cars/register2`, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to register the car, verify the data entered.');
                    return response.json();
                })
                // eslint-disable-next-line no-unused-vars
                .then(data => {
                    this.alertMessage = 'Car registered successfully!';
                    this.success = true;
                    this.car.licensePlate = '';
                    this.car.color = '';
                    this.car.photo = null;

                    setTimeout(() => {
                        this.alertMessage = '';
                        this.showRegistrationForm = false;
                    }, 2000);
                })
                .catch(error => {
                    this.alertMessage = error.message;
                    this.success = false;
                });
        },
 
        showMenu() {
            this.car.licensePlate = '';
            this.car.color = '';
            this.car.photo = null;
            this.showRegistrationForm = false;
        },

        handleFileUpload(event) {
            const files = event.target.files;

            if (files.length > 0) {
                const file = files[0];
                this.car.photo = file;
                this.selectedFileName = file.name;
            } else {
                this.car.photo = null;
                this.selectedFileName = '';
            }
        },

        showRegisterForm() {
            this.showRegistrationForm = true;
        },

        listCars() {
            this.showCarsList = true;
            this.noCarsRegistered = false;
            this.checkServerStatus();

            if (!this.serverOnline) {
                return;
            }

            fetch(`http://${this.load_balancer_url}/cars/list`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load cars.');
                    }
                    return response.json();
                })
                .then(carsFromServer => {
                    this.cars = carsFromServer;
                    this.serverOnline = true;
                    if (this.cars.length === 0) {
                        this.noCarsRegistered = true;
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.serverOnline = false;
                    this.cars = [];
                    this.noCarsRegistered = true;
                });
        },

        resetCarToUpdate() {
            this.carToUpdate = {
                licensePlate: '',
                newLicensePlate: '',
                color: '',
                photo: null
            };
        },

        resetViews() {
            this.showRegistrationForm = false;
            this.showCarsList = false;
            this.showWithdrawForm = false;
            this.showUpdateLicensePlateFormView = false;
            this.showUpdateForm = false;
        },

        fetchCars() {
            fetch(`http://${this.load_balancer_url}/cars/list`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load cars.');
                    }
                    return response.json();
                })
                .then(carsFromServer => {
                    this.cars = carsFromServer;
                    if (this.cars.length === 0) {
                        this.noCarsRegistered = true;
                    } else {
                        this.noCarsRegistered = false;
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.noCarsRegistered = true;
                });
        },

        showUpdateLicensePlateForm() {
            this.fetchCars();
            if (this.cars.length === 0) {
                this.withdrawAlertMessageA = 'No cars registered yet.';
                this.showUpdateLicensePlateFormView = false;

                setTimeout(() => {
                    this.withdrawAlertMessageA = '';
                }, 5000);

                this.success = false;
            } else {
                this.resetViews();
                this.resetCarToUpdate();
                this.showUpdateLicensePlateFormView = true;
            }
        },

        showMenuD() {
            this.resetViews();
        },

        verifyCarExists() {
            fetch(`http://${this.load_balancer_url}/cars/${this.updateLicensePlate}`)
                .then(response => {
                    if (!response.ok) throw new Error('Car not found.');
                    return response.json();
                })
                .then(car => {
                    this.carToUpdate = car;
                    this.updateLicensePlate = '';
                    this.showUpdateLicensePlateFormView = false;
                    this.showUpdateForm = true;
                    this.updateAlertMessage = '';
                    this.success = true;
                })
                .catch(error => {
                    this.updateAlertMessage = error.message;
                    this.success = false;
                    this.showUpdateForm = false;
                });
        },

        showMenuB() {
            this.showCarsList = false;
            this.noCarsRegistered = false;
        },

        showUpdateFormView() {
            this.resetViews();
            this.showUpdateForm = true;
        },

        updateCar() {
            const formData = new FormData();
            formData.append('license_plate', this.updateLicensePlate);
            formData.append('color', this.carToUpdate.color);

            fetch(`http://${this.load_balancer_url}/cars/update`, {
                method: 'PATCH',
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to update the car, verify the data entered.');
                    return response.json();
                })
                // eslint-disable-next-line no-unused-vars
                .then(data => {
                    this.withdrawAlertMessageB = data.message;
                    this.success = true;

                    setTimeout(() => {
                        this.showUpdateForm = false;
                        this.resetCarToUpdate();
                        this.withdrawAlertMessageB = '';
                    }, 3000);

                })
                .catch(error => {
                    this.withdrawAlertMessageB = error.message;
                    this.success = false;
                });
        },

        handleUpdateFileUpload(event) {
            const files = event.target.files;

            if (files.length > 0) {
                const file = files[0];
                this.carToUpdate.photo = file;
            } else {
                this.carToUpdate.photo = null;
            }
        },

        withdrawCar() {
            fetch(`http://${this.load_balancer_url}/cars/withdraw`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ license_plate: this.withdrawLicensePlate })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Error withdrawing car.');
                    return response.json();
                })
                .then(data => {
                    this.withdrawAlertMessageB = data.message;
                    this.success = true;
                    setTimeout(() => {
                        this.showWithdrawForm = false;
                        this.withdrawLicensePlate = '';
                        this.withdrawAlertMessageB = '';
                    }, 3000);
                })
                .catch(error => {
                    this.withdrawAlertMessageB = error.message;
                    this.success = false;
                });
        },

        showWithdrawCarForm() {
            this.withdrawAlertMessageB = '';
            this.fetchCars();
            if (this.noCarsRegistered) {
                this.withdrawAlertMessageA = 'No cars to withdraw.';

                setTimeout(() => {
                    this.withdrawAlertMessageA = '';
                }, 5000);

                this.success = false;
                this.showWithdrawForm = false;
                this.showRegistrationForm = false;
                this.showCarsList = false;
            } else {
                this.withdrawAlertMessageA = '';
                this.showWithdrawForm = true;
                this.showRegistrationForm = false;
                this.showCarsList = false;
                this.noCarsRegistered = false;
            }
        },

        showMenuC() {
            this.showWithdrawForm = false;
        },
    },

    mounted() {
        console.log(this.load_balancer_url)
        this.checkServerStatus();
    }
};
</script>

<style>
body,
html {
    height: auto;
    min-height: 100%;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Arial', sans-serif;
    background-color: #f7f7f7;
}

.welcome-menu {
    text-align: center;
    width: 100%;
    padding: 50px;
}

.welcome-menu h2 {
    margin-bottom: 20px;
}

.menu-options button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.menu-options button:hover {
    background-color: #0056b3;
}

.registration-form {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    padding: 2rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-radius: 8px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.registration-form h2 {
    margin-bottom: 1rem;
}

.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.form-group label {
    margin-right: 0.5rem;
}

input[type="color"] {
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    width: 2.5em;
    height: 2.5em;
    cursor: pointer;
    background: transparent;
    outline: none;
    padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
    border: none;
}

input[type="color"]::-webkit-color-swatch {
    border: none;
}

input[type="color"]::-moz-color-swatch {
    border: none;
}

input[type="color"]::-moz-focus-inner {
    border: 0;
}

.registration-form input,
.registration-form button {
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

.registration-form button {
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.registration-form button:not(:last-child) {
    margin-right: 0.5rem;
}

.registration-form button:hover {
    background-color: #0056b3;
}

.custom-file-input {
    display: inline-block;
}

.button-group {
    display: flex;
    justify-content: space-between;
}

.alert {
    text-align: center;
    padding: 10px;
    margin-top: 20px;
    border-radius: 4px;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
}

.car-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 550px));
    grid-gap: 20px;
    margin-top: 20px;
    padding: 20px;
}

.car-list-title {
    text-align: center;
    margin-top: 0;
    padding-top: 20px;
}

.car-item {
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.car-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
}

.car-details {
    padding: 0.5rem;
}

.car-details p {
    margin: 0.5rem 0;
}

.back-to-menu-btn {
    display: block;
    width: auto;
    margin: 20px auto;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.back-to-menu-btn:hover {
    background-color: #0056b3;
}

.withdraw-form {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    padding: 2rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-radius: 8px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.withdraw-form h2 {
    margin-bottom: 1rem;
}

.withdraw-form input,
.withdraw-form button {
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

.withdraw-form button {
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.withdraw-form button:not(:last-child) {
    margin-right: 0.5rem;
}

.withdraw-form button:hover {
    background-color: #0056b3;
}
</style>
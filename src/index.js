const cards = document.querySelectorAll('.card');

/* View Controller
-----------------------------------------*/
const btns = document.querySelectorAll('.js-btn');
btns.forEach(btn => {
    btn.addEventListener('click', on_btn_click, true);
});
function on_btn_click(e) {
    const nextID = e.currentTarget.getAttribute('data-target');
    const next = document.getElementById(nextID);
    if (!next) return;
    bg_change(nextID);
    view_change(next);
    return false;
}

/* Add class to the body */
function bg_change(next) {
    document.body.className = '';
    document.body.classList.add('is-' + next);
}
/* Add class to a card */
function view_change(next) {
    cards.forEach(card => {card.classList.remove('is-show');});
    next.classList.add('is-show');
}

document.addEventListener('DOMContentLoaded', function () {
    const userList = document.getElementById('userList');
    let users = [
        {
            name: "",
            surname: "",
            phone_number: "",
            address: "",
            church: ""
        }
    ];
    getUsers();

    let editingUserIndex = -1; // Initialize to -1, meaning no user is being edited
    let editName = document.getElementById('editName');
    let editSurname = document.getElementById('editSurname');
    let editPhoneNumber = document.getElementById('editPhoneNumber');
    let editAddress = document.getElementById('editAddress');
    let editChurch = document.getElementById('editChurch');
    let deleteButton = document.getElementById('dltbtn');

    function getUsers() {
        fetch('http://localhost:3001/womans')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // This may throw an error if the response body is empty
            })
            .then(users => {
                // Delay for one second (1000 milliseconds)
                setTimeout(() => {
                    if (!Array.isArray(users)) {
                        console.error('Invalid users data. Expected an array.');
                        return;
                    }
                    renderUserList(users);
                }, 1500);
            })
            .catch(error => {
                if (error.name === 'SyntaxError') {
                    console.error('Error parsing JSON. Response body might be empty.');
                } else {
                    console.error('Error fetching users:', error);
                }
            });
    }

    function renderUserList(users) {
        userList.innerHTML = ''; // Clear the table content

        if (!Array.isArray(users)) {
            console.error('Invalid users data. Expected an array.');
            return;
        }

        users.forEach((user, index) => {
            console.log("rendering User list")
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.phone_number}</td>
                <td>${user.church}</td>
                <td>${user.city}</td>
                <td>${user.home}</td>
                <td>${user.payment}</td>
                <td class="right aligned">
                    <button type="button" class="btn btn-sm editModalButton" style="background-color: rgba(253, 188, 22, 0.67)">Edit</button>
                </td>
                <td class="right aligned">
                    <button type="button" data-user-index="${index}" data-user-id="${user._id}" class="btn btn-sm deleteModalButton" style="background-color: #ea7e7e">Delete</button>
                </td>
            `;
            userList.appendChild(row);

            // Add event listeners to the buttons in this row
            let editButton = row.querySelector('.editModalButton');


            editButton.addEventListener('click', function () {
                let rowIndex = editButton.closest('tr').rowIndex - 1;
                openEditModal(rowIndex); // Open the edit modal for the user at this index
            });

            row.querySelector('.deleteModalButton').addEventListener('click', function () {
                const userIndexToDelete = this.getAttribute('data-user-index');
                const userIdToDelete = this.getAttribute('data-user-id');

                if (userIndexToDelete !== null && userIndexToDelete !== undefined && users[userIndexToDelete]) {
                    const userNameToDelete = users[userIndexToDelete].name;
                    // Now you can use userNameToDelete in your modal content
                    document.querySelector('.ui.modal.deleteModal h3 span').innerText = userNameToDelete;

                    // Rest of your delete logic
                }
                deleteButton.addEventListener('click', async () => {
                    console.log(userIdToDelete)

                    try {
                        const response = await fetch(`http://localhost:3001/womans/${userIdToDelete}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!response.ok) {
                            console.error('Error deleting user. Response:', response);
                            throw new Error('Network response was not ok');
                        }

                        const result = await response.json();
                        console.log(result); // Log the server response

                        // Optionally, update the UI or fetch updated data
                        getUsers();
                    } catch (error) {
                        console.error('Error deleting user:', error);
                    }
                });
            });
        });
    }

    //Login button clicking
    document.getElementById('loginButton').addEventListener('click', function () {
        // Get username and password from input fields
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Make a POST request to your server
        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // This may throw an error if the response body is empty
            })
            .then(data => {
                console.log('Login successful:', data);
                // Handle successful login, e.g., redirect to a new page or open the next modal
                openNextModal(); // Function to open the next modal
            })
            .catch(error => {
                console.error('Error logging in:', error);
                // Handle login error, e.g., display an error message to the user
            });

        function openNextModal() {
            const nextID = document.getElementById('loginButton').getAttribute('data-target');
            const next = document.getElementById(nextID);
            if (!next) return;
            bg_change(nextID);
            view_change(next);
            return false;
        }
    });


    function openEditModal(index) {
        console.log("openEditModal +  " + index)
        editingUserIndex = index;
        let user = users[index];

        editName.value = user.name;
        editSurname.value = user.surname;
        editPhoneNumber.value = user.phone_number;
        editAddress.value = user.address;
        editChurch.value = user.church;
    }
    // Save button in the edit modal
    document.querySelector('.ui.modal.editModal .green.button').addEventListener('click', function () {
        if (editingUserIndex !== -1) {
            let user = users[editingUserIndex];
            user.name = editName.value;
            user.surname = editSurname.value;
            user.phone_number = editPhoneNumber.value;
            user.address = editAddress.value;
            editChurch.value = user.church;

            // Update the table
            getUsers();
            // Close the edit modal
            document.querySelector('.ui.modal.editModal').style.display = 'none';
            editingUserIndex = -1;
            console.log("Success editing user")
        }
    });

// Cancel button in the edit modal
    document.querySelector('.ui.modal.editModal .red.button').addEventListener('click', function () {
        // Close the edit modal without saving
        document.querySelector('.ui.modal.editModal').style.display = 'none';
        editingUserIndex = -1;
        console.log("Success cancel button")
    });

    // Save button in the add modal
    document.querySelector('.ui.modal.addModal .green.button').addEventListener('click', function () {
            console.log("Green button")
            const newNameSurname = document.getElementById('newNameSurname');
            const newPhone = document.getElementById('newPhone');
            const newChurch = document.getElementById('newChurch');
            const newCity = document.getElementById('newCity');
            const newHome = document.getElementById('newHome');
            const newPayment = document.getElementById('newPayment');

            fetch('http://localhost:3001/womans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newNameSurname.value,
                    phone_number: newPhone.value,
                    church: newChurch.value,
                    city: newCity.value,
                    home: newHome.value,
                    payment: newPayment.value
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Log the response from the server
                    getUsers();
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            // Close the add modal
            document.querySelector('.ui.modal.addModal').style.display = 'none';
            document.getElementById('newNameSurname').value = '';
            document.getElementById('newPhone').value = '';
            document.getElementById('newChurch').value = '';
            document.getElementById('newCity').value = '';
            document.getElementById('newHome').value = '';
            document.getElementById('newPayment').value = '';
            console.log("Success editing user")

    });

// Cancel button in the add modal
    document.querySelector('.ui.modal.addModal .red.button').addEventListener('click', function () {
        // Close the edit modal without saving
        document.querySelector('.ui.modal.addModal').style.display = 'none';
        editingUserIndex = -1;
        console.log("Success cancel button")
    });

    getUsers();
});
const checkbox = document.getElementById('terms');
const greenButton = document.querySelector('.ui.green.ok.inverted.button');

// Function to update the disabled state of the green button
function updateGreenButtonState() {
    greenButton.disabled = !checkbox.checked;
}

// Add an event listener to the checkbox
checkbox.addEventListener('change', updateGreenButtonState);

// Set the initial state of the green button
updateGreenButtonState();

// Add an event listener to the green button
greenButton.addEventListener('click', function () {
    // Check if the checkbox is not checked
    if (!checkbox.checked) {
        // Add a red border to the checkbox
        checkbox.style.border = '2px solid red';
    } else {
        // Reset the border if the checkbox is checked
        checkbox.style.border = '';
        const newNameSurname = document.getElementById('registerNameSurname');
        const newPhone = document.getElementById('registerPhone');
        const newChurch = document.getElementById('registerChurch');
        const newCity = document.getElementById('registerCity');
        const newHome = document.getElementById('registerHome');
        const newPayment = '';

        fetch('http://localhost:3001/womans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newNameSurname.value,
                phone_number: newPhone.value,
                church: newChurch.value,
                city: newCity.value,
                home: newHome.value,
                payment: newPayment.value
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data); // Log the response from the server
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Close the add modal
        document.querySelector('.ui.modal.confirmModal').style.display = 'none';
        console.log("Green button clicked");
    }
});

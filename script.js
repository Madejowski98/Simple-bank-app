'use strict';

//! .toFixed is used in this code, I am aware that in a ideal situation it should be (number * 100) / 100, but it's not real money in this app, I'm also aware that .toFixed is rounding numbers
(function () {
  const account1 = {
    owner: 'Szymon Madejowski',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
      '2022-11-18T21:31:17.178Z',
      '2022-12-23T07:42:02.383Z',
      '2023-04-28T09:15:04.904Z',
      '2023-05-01T10:17:24.185Z',
      '2023-06-08T14:11:59.604Z',
      '2023-07-25T17:01:17.194Z',
      '2023-02-27T23:36:17.929Z',
      '2023-02-28T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pl-PL', //
  };

  const account2 = {
    owner: 'Kasia Kwiecinska',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
      '2022-11-01T13:15:33.035Z',
      '2022-11-30T09:48:16.867Z',
      '2022-12-25T06:04:23.907Z',
      '2023-01-25T14:18:46.235Z',
      '2023-02-05T16:33:06.386Z',
      '2023-02-10T14:43:26.374Z',
      '2023-02-25T18:49:59.371Z',
      '2023-03-26T12:01:20.894Z',
    ],
    currency: 'GBP',
    locale: 'en-UK',
  };

  const accounts = [account1, account2];

  /////////////////////////////////////////////////
  //! Elements
  const labelWelcome = document.querySelector('.welcome');
  const labelDate = document.querySelector('.date');
  const labelBalance = document.querySelector('.balance__value');
  const labelSumIn = document.querySelector('.summary__value--in');
  const labelSumOut = document.querySelector('.summary__value--out');
  const labelSumInterest = document.querySelector('.summary__value--interest');
  const labelTimer = document.querySelector('.timer');

  const containerApp = document.querySelector('.app');
  const containerMovements = document.querySelector('.movements');

  const btnLogin = document.querySelector('.login__btn');
  const btnTransfer = document.querySelector('.form__btn--transfer');
  const btnLoan = document.querySelector('.form__btn--loan');
  const btnClose = document.querySelector('.form__btn--close');
  const btnSort = document.querySelector('.btn--sort');

  const inputLoginUsername = document.querySelector('.login__input--user');
  const inputLoginPin = document.querySelector('.login__input--pin');
  const inputTransferTo = document.querySelector('.form__input--to');
  const inputTransferAmount = document.querySelector('.form__input--amount');
  const inputLoanAmount = document.querySelector('.form__input--loan-amount');
  const inputCloseUsername = document.querySelector('.form__input--user');
  const inputClosePin = document.querySelector('.form__input--pin');

  const formattedCurrency = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatMovementDate = function (date, locale) {
    const calculateDayPassed = (date1, date2) =>
      Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calculateDayPassed(new Date(), date);
    // console.log(daysPassed);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
  };
  //! SHOWING MOVEMENTS IN ACCOUNTS
  const showMovements = (acc, sort = false) => {
    containerMovements.innerHTML = '';

    const movs = sort
      ? acc.movements.slice().sort((a, b) => a - b)
      : acc.movements;

    movs.forEach((mov, i) => {
      const type = mov > 0 ? 'deposit' : 'withdrawal';
      const date = new Date(acc.movementsDates[i]);

      const displayDate = formatMovementDate(date, acc.locale);

      const formattedMov = formattedCurrency(mov, acc.locale, acc.currency);

      const html = `
  <div class="movements__row">
  <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>

  <div class="movements__date">${displayDate}</div>

  <div class="movements__value">${formattedMov}</div>
</div>
`;

      containerMovements.insertAdjacentHTML('afterbegin', html);
    });
  };

  const user = 'Szymon Madejowski'; // sm

  const calculateDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

    labelBalance.textContent = formattedCurrency(
      acc.balance,
      acc.locale,
      acc.currency
    );
  };

  const calculateDisplaySummary = function (acc) {
    const incomes = acc.movements
      .filter(mov => mov > 0)
      .reduce((acc, mov) => acc + mov, 0);

    labelSumIn.textContent = formattedCurrency(
      incomes,
      acc.locale,
      acc.currency
    );
    //! I am aware that filter is map and filter in one but it's easier to use it like this for me for this app
    const out = acc.movements
      .filter(mov => mov < 0)
      .reduce((acc, movement) => acc + movement, 0);
    labelSumOut.textContent = formattedCurrency(
      Math.abs(out),
      acc.locale,
      acc.currency
    );

    const interestRate = acc.movements
      .filter(mov => mov > 0)
      .map(deposit => (deposit * acc.interestRate) / 100)
      .filter(int => int >= 1)
      .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formattedCurrency(
      interestRate,
      acc.locale,
      acc.currency
    );
  };

  const createUsernames = function (accs) {
    accs.forEach(function (acc) {
      acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join('');
    });
  };

  createUsernames(accounts);

  const updateUI = function (acc) {
    showMovements(acc);
    calculateDisplayBalance(acc);
    calculateDisplaySummary(acc);
  };

  const startLogOutTimer = function () {
    const tick = function () {
      // call timer every second
      const minutess = String(Math.trunc(time / 60)).padStart(2, 0);
      const secondss = String(time % 60).padStart(2, 0);
      //in each call print the remaining time to the user interface
      labelTimer.textContent = `${minutess}:${secondss}`;

      // when the time is at 0 stop timer and log out (hide UI)
      if (time === 0) {
        clearInterval(timer);
        labelWelcome.textContent = 'Log in to get started';
        containerApp.style.opacity = 0;
      }
      // decrease 1 s
      time--;
    };
    // setting the time to 5 minutes
    let time = 300;
    // call the timer every second
    tick();
    const timer = setInterval(tick, 1000);

    return timer;
  };

  //! event handlers
  let currentAccount, timer;

  //! faking always logged in
  // currentAccount = account1;
  // updateUI(currentAccount);
  // containerApp.style.opacity = 100;

  const currentDate = new Date();
  const day = `${currentDate.getDate()}`.padStart(2, 0);
  const month = `${currentDate.getMonth()}`.padStart(2, 0);
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  btnLogin.addEventListener('click', function (robota) {
    robota.preventDefault();
    currentAccount = accounts.find(
      acc => acc.username === inputLoginUsername.value
    );
    console.log(currentAccount);

    if (currentAccount?.pin === +inputLoginPin.value) {
      //! display message
      labelWelcome.textContent = `Welcome back ${
        currentAccount.owner.split(' ')[0]
      }`;
      containerApp.style.opacity = 100;
      containerApp.style.visibility = 'visible';

      //!CREATING CURRENT DATE AND TIME FOR TRANSFERS

      const now = new Date();
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };

      labelDate.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(now);

      //! clear input field
      inputLoginUsername.value = inputLoginPin.value = '';
      inputLoginPin.blur();

      if (timer) clearInterval(timer);

      timer = startLogOutTimer();

      updateUI(currentAccount);
    }
  });

  const transfer = btnTransfer.addEventListener('click', function (event) {
    event.preventDefault();
    const amountOfTransfer = +inputTransferAmount.value;
    const receivableAccount = accounts.find(
      acc => acc.username === inputTransferTo.value
    );
    inputTransferAmount.value = inputTransferTo.value = '';

    if (
      amountOfTransfer > 0 &&
      receivableAccount &&
      currentAccount.balance >= amountOfTransfer &&
      receivableAccount.username !== currentAccount.username
    ) {
      currentAccount.movements.push(amountOfTransfer);
      receivableAccount.movements.push(amountOfTransfer);
      //! add transfer date for main and receivable acc
      currentAccount.movementsDates.push(new Date().toISOString());
      receivableAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      // reset the timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }
  });
  //! REQ A LOAN
  btnLoan.addEventListener('click', function (event) {
    event.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (
      amount > 0 &&
      currentAccount.movements.some(mov => mov >= amount * 0.1)
    ) {
      setTimeout(function () {
        currentAccount.movements.push(amount);

        //adding loan date
        currentAccount.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
        // reset the timer
        clearInterval(timer);
        timer = startLogOutTimer();
      }, 2500);
    }

    inputLoanAmount.value = '';
  });

  //! REMOVING A USER
  btnClose.addEventListener('click', function (event) {
    event.preventDefault();
    if (
      inputCloseUsername.value === currentAccount.username &&
      +inputClosePin.value === currentAccount.pin
    ) {
      const index = accounts.findIndex(
        account => account.username === currentAccount.username
      );

      accounts.splice(index, 1);

      containerApp.style.opacity = 0;
    }
    inputCloseUsername.value = inputClosePin.value = '';
  });

  let sorted = false;

  btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    showMovements(currentAccount.movements, !sorted);
    sorted = !sorted;
  });

  //!event handler for colors orangered on 2 when clicking label balance and blue on 3
  labelBalance.addEventListener('click', function () {
    [...document.querySelectorAll('.movements__row')].forEach(function (
      row,
      i
    ) {
      if (i % 2 === 0) row.style.backgroundColor = 'orangered';
      if (i % 3 === 0) row.style.backgroundColor = 'blue';
    });
  });

  //
})();

//! jak string z 111 zmienic na bezpieczny - createElement , textContent!

// __ BEM - Block-element-modifier

const mojdif = document.createElement('div');
mojdif.setAttribute('type', 'debil');
// mojdif.textContent = 'not good boss';
document.body.appendChild(mojdif);

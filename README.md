# SPA-приложение

***
***Это приложение написанное на Nest.js в рамках тестового задания от dZEN code.***

Тестирование проводилось через Postman WebSocket Request и Socket.io.

Приложение поставлено на сервер и доступно по адресу: ```http://167.172.189.214:3080```

## Установка и запуск

***
Клонирование приложения:

```bash
git clone https://github.com/DenisLokhtin/SPA-app.git
cd ./SPA-app
```

Запуск при помощи Docker`а:

(доступ http://127.0.0.1:3080)

```bash
docker-compose build
docker-compose up
```

Запуск при помощи npm в режиме разработки:

(доступ http://localhost:3061)

```bash
npm i
npm run start:dev
```

Запуск при помощи npm в режиме продакшена:

(доступ http://localhost:3061)

```bash
npm i
npm run start:prod
```

## Использование

***
**Для начала работы с приложением нужно зарегистрироваться и получить токен, который в будущем будет передаваться в
заголовках для авторизации пользователя.**

При помощи ```POST``` запроса обращаемся по адресу ```/user/register``` и в теле запроса передаём объект типа:

``` 
{
    "email": "test@gmail.com",
    "userName": "test name",
    "password": "123456789"
} 
```

И получаем ответ:

```
{
    "user": {
        "email": "1@gmail.com",
        "userName": "1",
        "id": 1,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlck5hbWUiOiIxIiwiZW1haWwiOiIxQGdtYWlsLmNvbSIsImlhdCI6MTY3NTQwNDI0N30.gjXiupqo9Ta9Ba7-wYLuHQCcSnZS1fdXLmYhpJRSY3c"
    }
}
```

***

Для входа после регистрации, при помощи ```POST``` запроса можно обратиться по адресу ```/user/login``` и в теле
запроса передать объект типа:

``` 
{
    "email": "test@gmail.com",
    "password": "123456789"
} 
```

И получить ответ:

```
{
    "user": {
        "id": 1,
        "email": "1@gmail.com",
        "userName": "1",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlck5hbWUiOiIxIiwiZW1haWwiOiIxQGdtYWlsLmNvbSIsImlhdCI6MTY3NTQwNDYxM30.l5giwu10zOByOi8LMz4CMrrJ91E4o7zhL4iaa-pv35g"
    }
}
```

*В дальнейшем token будет использован для авторизации.*

***
***Загрузка фотографий***

Загрузка фотографий происходит через ```POST``` запрос на адрес ```/comments/upload/{comment_id}``` в ответе мы
получаем ссылку на файл, в модель комментария автоматически добавляется ссылка на загруженный файл.

***

Все дальнейшие запросы должны выполнятся при помощи вебсокетов и Socket.io.

***Подключение к вебсокету происходит по адресу ```/comments```, а в заголовках, в поле ```authorization``` передаётся
токен полученный при входе или регистрации, если токен не передан или неверный - то соединение будет разорвано.***

Если вы подписаны на евент onFirstConnection, то при первом подключении вам придёт массив из 25 последних заглавных
комментариев.

Евенты доступные для подписки:

- onChangeQuery
- onMessageonFirstConnection
- onChangeRating
- onFirstConnection

***

Доступные сообщения для отправки вебсокетами:

- ***getComments (взять комментарии)***

Тут реализована сортировка, параметры передаются в теле запроса.

Допустимые параметры:

```
{
"page": number, (Необязательно, Число, по умолчанию 0, последние 25 комментариев. Допустимые параметры: все положительные числа от 0 до бесконечности)
"sort": string, (Необязательно, Строка, по умолчанию 'DESC'. Допустимые параметры: 'DESC', 'ASC')
"field": string (Необязательно, Строка, по умолчанию 'created_at'. Допустимые параметры: 'email', 'userName', 'created_at')
}
```

Если передать пустой объект – то вернутся комментарии отсортированные по умолчанию.

Пример ответа:

```
{
    "ACTION": "allComments",
    "BODY": []
}
```

***

- ***newComment (добавить комментарий)***

Пример объекта для создания комментария:

```
{
"text": "lorem ipsum dolor sit amet, consectetur adipiscing elit", (Обязательно, Строка. Допустимые параметры: строка от 30 символов)
"homePage": "https://github.com/DenisLokhtin/SPA-app", (Необязательно, Строка. Допустимые параметры: любой url адрес)
"parentId": 1, (Необязательно, Число. Допустимые параметры: любое число больше 0)
"recaptchaResponse": 1 (Для тестов капча отключена - поле не нужно, Строка. Допустимые параметры: любая строка)
}
```

Для создания комментария обязательно передавать только текст, для создания дочернего комментария в поле parentId
передаётся id уже существующего комментария.

Пример ответа:

```
{
    "ACTION": "newComment",
    "BODY": {
        "text": "lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "file": null,
        "homePage": null,
        "id": 1,
        "created_at": "2023-02-03T08:44:32.294Z",
        "rating": 0
    }
}
```

***

- ***changeRating (поставить оценку)***

Для изменения рейтинга комментария передаётся такой объект:

```
{
"id": number, (Обязательно, Число. Допустимые параметры: айди комментария, все положительные числа от 0 до бесконечности)
"rating": number, (Обязательно, число. Допустимые параметры: 0 или 1)
}
```

При отправке в поле rating 1 - значения рейтинга повысится, и наоборот с 0. Поставить повторную оценку с тем же знаком
нельзя - либо одна положительная, либо одна отрицательная.

Пример ответа:

```
{
    "ACTION": "changeRating",
    "BODY": {
        "id": 2,
        "created_at": "2023-02-03T08:57:32.060Z",
        "rating": -1,
        "file": null,
        "homePage": null,
        "text": "lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "ratingDown": [
            {
                "id": 1,
                "email": "1@gmail.com",
                "userName": "1",
                "password": "$2b$10$EjoJkZOfXO9EyhLuyXBEM.KFy2xV.486Hr8BkagP6C.BKFJ4zWFXS",
                "access_token": null
            }
        ],
        "ratingUp": []
    }
```

***

![readmeImages/spaApp.png](readmeImages/spaApp.png)
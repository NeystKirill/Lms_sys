# LMS System — Обновление

## Что изменилось

### Backend (новые файлы и изменения)

#### Новые модели
- **`Grade.js`** — оценки студентов (значение 0–100 или «Н», привязка к уроку и студенту)
- **`Lesson.js`** — обновлена: добавлены поля `status` (active/cancelled/replaced), `statusNote`, `replacesLessonId`

#### Новые контроллеры и маршруты
- **`gradeController.js`** + **`gradeRoutes.js`** — CRUD оценок
  - `GET /api/grades/my` — мои оценки (студент)
  - `GET /api/grades/group` — оценки группы (учитель/админ)
  - `GET /api/grades/lesson/:id` — оценки по уроку
  - `POST /api/grades/bulk` — выставить оценки пачкой
- **`materialController.js`** + **`materialRoutes.js`** — полный CRUD материалов
  - `GET /api/materials/lesson/:id`
  - `POST /api/materials`
  - `PUT /api/materials/:id`
  - `DELETE /api/materials/:id`
- **`scheduleRoutes.js`** — расширен:
  - `PATCH /api/schedule/lesson/:id/cancel` — отменить пару
  - `PATCH /api/schedule/lesson/:id/restore` — восстановить пару
  - `PATCH /api/schedule/lesson/:id/replace` — заменить предмет/учителя
  - `GET /api/schedule/options` — список предметов и учителей для замены

#### Обновлённый seed.js
- Все 22 студента группы ПО2406
- 5 тестовых материалов для уроков
- Расписание на 3 недели вперёд
- Тестовые посещаемость для прошедших дней

---

### Frontend (изменения)

#### Профиль (`/profile`) — теперь 3 разных вида
- **Студент** — аналитика посещаемости (кольцевой график, статистика), история оценок по предметам
- **Учитель** — таблица аналитики по всей группе (посещаемость + средний балл)
- **Администратор** — карточки быстрых действий (управление пользователями, расписанием, группами)

#### Материалы (`/materials`)
- Реальная форма добавления: название, тип (видео/ссылка/файл), URL, описание
- Редактирование и удаление материалов
- Иконки по типу материала
- Навигация по неделям
- Отображение статуса пары (отменена / замена)

#### Посещаемость (`/attendance`)
- Новая вкладка **«Оценки»** рядом с посещаемостью
- Выставление оценок 0–100 или «Н» с быстрыми кнопками
- Фильтр по предмету в истории (для студента)
- Обновлённый дизайн статистики

#### Управление (`/manage`)
- Новая вкладка **«📅 Расписание»** (только для администратора)
  - Сетка расписания на 5 дней
  - Кнопки: «Отменить пару», «Замена» (с выбором предмета/учителя), «Восстановить»
  - Отменённые пары выделяются красным, заменённые — жёлтым

#### Dashboard (`/dashboard`)
- Расписание показывает статус пары (❌ Отменена / 🔄 Замена)

---

## Аккаунты — файл `ACCOUNTS.env`

Все логины и пароли сохранены в `ACCOUNTS.env` в корне проекта.

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@lms.kz | admin123 |
| Кусманова | kusmanova@lms.kz | teacher123 |
| Жайлеубай | zhayleubay@lms.kz | teacher123 |
| Акубаева | akubaeva@lms.kz | teacher123 |
| Каракузов | karakuzov@lms.kz | teacher123 |
| Абдышев Алдияр | abdyshev@lms.kz | Po2406_abd |
| Айт Ерәли | ait@lms.kz | Po2406_ait |
| Бахытжан Бахтияр | bakhytjan@lms.kz | Po2406_bah |
| Берик Мансур | berik@lms.kz | Po2406_ber |
| Григорьев Богдан | grigoriev@lms.kz | Po2406_gri |
| Жаманбалинов Агмаз | zhamanbalinov@lms.kz | Po2406_zha |
| Жоламан Султан | zholaman@lms.kz | Po2406_zhl |
| Жумабаев Жангир | zhumabaev@lms.kz | Po2406_zhb |
| Жумабеков Алдияр | zhumabekov@lms.kz | Po2406_zbk |
| Зарахов Берс | zarakhov@lms.kz | Po2406_zar |
| Кадыров Кирилл | kadyrov@lms.kz | Po2406_kad |
| Кадырбай Каусар | kadyrbay@lms.kz | Po2406_kdb |
| Койшыбай Арсен | koishibay@lms.kz | Po2406_koi |
| Орынгали Әділжан | oryngali@lms.kz | Po2406_ory |
| Оспанов Бектемир | ospanov@lms.kz | Po2406_osp |
| Оспанова Айым | ospanova@lms.kz | Po2406_osa |
| Отинчиев Гани | otynchiev@lms.kz | Po2406_oti |
| Сабанчи Айли | sabanchi@lms.kz | Po2406_sab |
| Садыков Альтаир | sadykov@lms.kz | Po2406_sad |
| Сейтхан Альтаир | seithkhan@lms.kz | Po2406_sei |
| Уапов Саид | uapov@lms.kz | Po2406_uap |
| Ульянов Александр | ulyanov@lms.kz | Po2406_uly |

---

## Запуск

```bash
# Backend
cd back
cp .env.example .env
# Отредактируй MONGO_URI и JWT_SECRET в .env
npm install
npm run seed    # Заполнить БД тестовыми данными
npm run dev     # Запустить сервер

# Frontend
cd front
npm install
npm run dev     # http://localhost:5173
```

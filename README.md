# Change Log

## 2017-12-30 ## 

### Изменения в существующих ресурсах ###
1.   < 1)POST  /session/voting – создание голосования
     POST  /plan/attendReg – создание регистрации
  POST  /session/voting/{id}/vote – подача голоса
  POST  /plan/attendReg/{id}/register – регистрация >

Изменен формат успешного ответа. Теперь используется стандартный json-формат результата (status, message, userMessage, result). В поле result – ID добавленного/измененного объекта, соответственно Voting, AttendantsReg, Vote, или Attendant. Этот Id также дублируется в заголовке Location.

2) POST  /session/voting/{id}/vote – подать голос

If user submits multiple votes, ONLY THE FIRST Vote is accepted.
New vote attempt returns error.

2017-12-28

Ресурсы, работающие без авторизации (но по https)
GET  /open/info/currentTime		- текущее время сервера в формате Long
GET  /open/info/testConnection	- проверка соединения

Оба ресурса возвращают объект JSON общего формата (как в случае успеха, так и при ошибках):
{ 
	"status" : xxx, 
	"message" : <message or null>, 
	"userMessage" : <message or null>,
	"result" : <optional, resulting value> 
	"errorCode" : <optional, unused> 
	"pagination" : <optional, unused>
}

2017-12-10

Импорт повестки
1) Download: шаблон Excel-файла для повестки
			GET /plan/issue/import/template/xlsx/json
			GET /plan/issue/import/template/xlsx

Download agenda template for import in .xlsx format
Response:  JSON / binary stream,
       or code 404 if template is not found.

2) Upload: Excel-файл с повесткой 
			POST /plan/issue/import/xlsx?sessionId=6

     * @throws WebApplicationException if unable to import issues
     *          (cannot parse file, issue numbers duplicate, cannot find reporter, ...)

Import all Issue entities from given Excel file and add them to the specified Session.
Issues are stored with the same numbers as given in file.
Supported Excel file versions: 2007 or later (.xlsx)
File must fit the template given by:  GET /plan/issue/import/template/xlsx.
Parameters: 
sessionId –  Id of existing Session, where to store Issues.
        This session must not have issues with the same numbers as imported issues.
Attachment :	 Excel file (.xlsx, version 2007 or later)
Response: 	"ok" + message    if successful; 
                        401 "unauthorized" + error description;
                        400 "bad request" + error description,  if file format is invalid, or file does not fit template;
                        422 "Unprocessable Entity" + list of errors to display in UI,   if issues validation fails:
                                required issue properties not specified, numbers duplicate, cannot find reporter, ...;
                        500 "internal server error" + error description,   if errors occur during import process.

Sample request:

POST https://host:8443/council/rs/plan/issue/import/xlsx?sessionId=6

Accept	*/*
Accept-Encoding	gzip, deflate, br
Accept-Language	en-US,en;q=0.5
Authorization		Basic X2FkbWluOmFkbWlu
Connection		keep-alive
Content-Length		34868
Content-Type		multipart/form-data
Host				localhost:13443
Origin			null

-----------------------------4827543632391
Content-Disposition: form-data; name="file"; filename="Порядок денний 06 сесії.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<Binary file data ... >
-----------------------------4827543632391--

Ответы на запросы  

Ошибки: По всем запросам в случае ответов 400, 401, 404, 422 и 500 – в теле ответа находится короткое описание ошибки, например:
{
  "status": 500,
  "message": "Unable to parse agenda file.",
  "userMessage": "Файл порядку денного має невірний формат, або не відповідає шаблону.",
  "code": "service-exception"
}
code – сode of error in the system (not used);
status – http response status code;
message – technical description of the error;
userMessage – user-friendly description of the error (to display in UI).

Успешно: по запросам POST (в зависимости от запроса) тело ответа может:
а) содержать json-объект (тип объекта зависит от запроса);
б) содержать короткое описание результата, например:
{
  "status": 200,
  "message": "9 Issues imported.",
  "userMessage": " Імпортовано 9 питаннь."
}
в) содержать id созданного объекта:
{
  "status": 201,
  "id": 12
}

2017-12-06

Изменения существующих ресурсах
1) Управление заседанием:
      POST  /session/control/(pause|resume|end)
      POST  /session/control/current/(infoScreen|act|issue|state)

В теле ответа (в случае успеха, код 200) добавлен json-объект, описывающий измененное текущее состояние. Такой же объект рассылается в уведомлениях.

2) Смена текущего состояния: 
   POST /session/control/current/state 
   body: { "convocationId" : 4 } или { "sessionId" : 4 }

При смене текущего созыва и/или сессии стираются все остальные поля Current. 
Указанный созыв/сессия должен существовать.
Создан ли для созыва список депутатов и создано ли для сессии хотя бы одно заседание не проверяется. Для этого есть POST  /session/control/start.
2017-12-05

Изменения в БД и существующих ресурсах
1)  POST  /session/voting/{id}/start – старт голосования
     POST  /session/attendReg/{id}/start – старт регистрации
     POST  /session/control/start/{id} – старт сессии:

В теле ответа (в случае успеха, код 200) добавлен json-объект, описывающий начатое голосование/регистрацию/сессию. Объект – такой же, как в уведомлениях.

2)  POST  /session/voting – создание голосования
     POST  /session/attendReg – создание регистрации
  POST  /session/voting/{id}/vote – подача голоса
  POST  /session/attendReg/{id}/register – регистрация

В теле ответа – (в случае успеха, код 201) json, содержащий ID добавленного объекта
Этот Id дублируется в заголовке Location.

3)  Таблица Person – добавлено поле gender – однобуквенное обозначение пола: ‘M’, ‘F’.
     Изменены представления  GET /subj/person, GET /subj/ps, GET /session/speech  – добавлено свойство gender. 

4)  В БД добавлен контроль на недопустимые значения, в т.ч.:
- для дат, не допускается внесение дат с нулями: «0000-00-00». 
- для строк не допускается внесение строк, превышающих длину поля 


2017-11-30

Изменения в БД и существующих ресурсах
1)  POST  /session/control/start/{id} – старт сессии:

Starts the CouncilSession, i.e. sets sessionId and meetingId in CurrentState.
Other properties of CurrentState (activityId, attendRegId, ...), except convocationId, are erased.
	--> (!) Attendants registration is needed to set totalMembersCount and attendMembersCount again 
CouncilSession instance with given ID must already exist in DB.
If given CouncilSession has Meetings then the first of these Meetings becomes current, otherwise a new Meeting is created. Start a Council Session (i.e. make it current session) and notify clients. 	


2) POST  /session/voting/{id}/start – начать созданное ранее голосование, 	
с оповещением

Start a Voting (i.e. make it current voting) and notify clients. Voting instance must already exist in DB.
Affects:  CurrentState.votingId and Voting.xxxMembersCount, Votes

(!) Allows to start Voting ONLY if it has resolutionState.id=”new”, i.e. if it is not completed yet. 

To start Voting, CurrentState.attendRegId must contain the ID of the most recent completed Attendants Registration.
When Voting starts, some vote values are pre-set to "absent", according to Attendants Registration results.
Voters that were absent at the Attendants Registration still CAN submit their votes.

End by timer: 
If Voting is started with property endByTimer=1, then it is ended automatically.
If such voting is then ended explicitly, then clients will be notified with 'session-voting-end' event twice.

3) POST  /session/attendReg/{id}/start – начать созданную ранее регистрацию, 	
с оповещением

Start an Attendants Registration (i.e. make it current) and notify clients. 
AttendantsReg instance must already exist in DB.
Sets CurrentState.attendRegId. Sets AttendantsReg.time to current time.

End by timer:
If Attendants Registration is started with property endByTimer=1, then it is ended automatically.
If such Attendants Registration is then ended explicitly, then clients will be notified with 'session-voting-end' event TWICE.


2017-11-28

Проведение регистрации присутствующих (AttendantsReg)

1) POST  /plan/attendReg – создать новую регистрацию

Create new AttendantsReg for existing Meeting.
Creates full set of Attendants for new AttendantsReg, one for each active council member, and initializes them with default values (“absent”).
Body: 	Describes the attendantsReg to be created.	
All properties except meetingId are optional. All unspecified properties are set to default.
{
    "meetingId": { "id" : 1 },
    "time": 1501920240000,
    "comment": "після перерви",
    "timer": 10,
    "endByTimer": true
}
 Response: 	"201 created" + location header if successful, or "unauthorized", or "bad request", or "internal server error"

2) POST  /plan/attendReg/{id}/start – начать созданную ранее регистрацию, 	
с оповещением

Start an AttendantsReg (i.e. make it current) and notify clients. 
AttendantsReg instance must already exist in DB.
Sets CurrentState.attendRegId. Sets AttendantsReg.time to current time.
End by timer:
If Attendants Registration is started with property endByTimer=1, then it is ended automatically.
If such Attendants Registration is then ended explicitly, then clients will be notified with ' session-attendants-reg-end' event TWICE.
Param: 	id – ID of previously created AttendantsReg
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error".
              	Body: Successful: /start - AttendantsReg that was started (json);  /end – empty;	
		Error: error description
Note:		Returns immediately, before all clients are notified.
Notify:		Event containing updated CurrentState and AttendantsReg that was started.

3) POST  /plan/attendReg/{id}/(end|stop) – завершить регистрацию, посчитать результат, с оповещением

End AttendantsReg, calculate its result and broadcast the event to clients. 
       AttendantsReg instance and its Attendants must already exist in DB.	
       This method must be called ONCE for AttendantsReg immediately AFTER it is completed.
       Results are stored in CurrentState and then used in Voting.
       CurrentState.attendRegId is not erased. 
Param:	id – ID of completed AttendantsReg
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error"
Note:	Sends response with 1 sec delay, 	
after result is calculated, but before all clients are notified.
Notify:		Event containing updated CurrentState, and count of attendants.
{ 
   "id":null,
   "time":1511305358829,
   "code":"session-attendants-reg-end",
   "currentState": { 
        "id":1, "convocationId":4, ...,
        "totalMembersCount": 8,
        "attendMembersCount": 5
    },
    "object": {
         "validReasons": 0,
         "total": 8,
         "absent": 3,
         "present": 5
    }
}

4) GET  /plan/attendReg/{id}/count – посчитать результат регистрации (количество присутствующих), не сохраняет результат в CurrentState для использования в голосованиях.

5) POST  /plan/attendReg/{id}/register  –  регистрация одного члена совета

Submit an Attendant.  ONLY current AttendantsReg accepts attendants.
Param:	id – ID of current AttendantsReg (NOT USED)
Body:	Attendant to register. 		
Must contain properties: regId, present 	
(personState is defined by authorized user).
{
    "regId":  { "id": 2 },
    "present":  true
}
Response: 	"201 created" + location header if successful, or "unauthorized", or "bad request", or "internal server error"

Новый ресурс   –  выступление.
GET /session/speech    
Параметры:  
title=про соц      - фильтр по заголовку вфыступеления (поисковая строка)
draft=0|no|false   - фильтр: черновик/не черновик, по умолчанию - все
speechType=co-report - фильтр: тип выступления (SpeechType.code)
speechState=spoken - фильтр: состояние выступления (SpeechState.code)

Фильтры, относящиеся к активности:
actId=1                 - фильтр: Id активности
actTimeFrom, actTimeTo  - фильтр: диапазон времени активности
actTopLevel=0|no|false  - фильтр: активность верхнего уровня/дочерняя
actType=consider    - фильтр: тип активности (ActivityType.code)
actPointType=res-project  - фильтр: тип объекта активности (PointType.code)
actSpeechType=proposition - фильтр: тип выступления, инициирующего активность
actParentId=1         - фильтр: родительская активность
issueId=1          -  фильтр: id вопроса повестки
issueNum=2         - фильтр: учетный номер вопроса в повестке

archived=0|no|false  - фильтр: выдавать архивированные, по умолчанию - 0
orderBy=time         - поддерживается только один вариант сортировки
viewMode=compact     - только для отладки, 
skip=1&limit=1       - для постраничного получения результатов 
 
Подресурсы:  
/session/speech	- список выступлений
/session/speech/{id} – одно выступление, подробное представление
/session/speech/(count|exists)?filters...– подсчет выступлений (с фильтром)


Изменения в БД и существующих ресурсах
- Таблица Current – добавлено поле  attendRegId – текущая регистрация присутствующих
Устанавливается при запуске регистрации, и сохраняется до следующей регистрации, либо до конца заседания/перерыва. После каждого перерыва нужно снова проводить регистрацию (иначе не будет работать голосование).
- Таблица Attendants_Reg – добавлены поля  timer, fEndByTimer – аналогично параметрам голосования

- POST /session/voting/{id}/(end|stop) – изменен формат нотификации

Notify:		Event containing updated CurrentState, completed Voting with resolutionState 	
 		and count of votes for this Voting:
{ 
   "id":null,
   "time":1511305358829,
   "code":"session-voting-end",
   "currentState": { "id":1,"convocationId":4,... },
   "object": {
        "voting": { "id":10, ..., "resolutionState":{...} },
        "voteCount": [ {...for...}, {...against...}, … }
   } 
}

когда приходит оповещение об окончании голосования/рег.присутствующих – в событии находятся все данные о результате, 	
-> не нужно делать отдельного запроса чтобы получить результат


2017-11-25

Управление сессией  

1)  POST  /session/control/start/{id}

Starts the CouncilSession, i.e. sets sessionId and meetingId in CurrentState.
Other properties of CurrentState (activityId, attendRegId, ...), except convocationId, are erased.
	--> (!) Attendants registration is needed to set totalMembersCount and attendMembersCount again 
CouncilSession instance with given ID must already exist in DB.
If given CouncilSession has Meetings then the first of these Meetings becomes current, otherwise a new Meeting is created. Start a Council Session (i.e. make it current session) and notify clients. 	


Param: 	id – ID of existing Council Session
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error"
Body: Success: Session that was started (json).
		Error: error description
Note:		Returns immediately, before all clients are notified.
Notify:		Event containing updated CurrentState and Council Session that was started.

2)  POST  /session/control/(pause|resume|end)

Pause/resume/end CURRENT Council Session and notify clients. 	
Council Session instance must already exist in DB.
Does NOT affect any entities except Current State.
(!) Each action partially erases Current State properties (!)
Path
Erased properties
/pause
topActivityId, activityId, votingId
/resume
topActivityId, activityId, votingId, attendRegId, totalMembersCount, attendMembersCount
(new attendants registration is needed)
/end
sessionId, meetingId, issueId, 
topActivityId, activityId, votingId, infoScreenState

Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error"
Body: Success: updated Current State (json).
		Error: error description
Note:		Returns immediately, before all clients are notified.
Notify:		Event containing 	
  -  updated CurrentState 
 	  -  ID of Council Session that was affected or null if there's no current Session.

3)  POST  /session/control/current/(infoScreen|act|issue|state)

Update Current State and notify clients. Does NOT affect any entities except Current State.
[optional] Body: 	currentState object contains new values for Current State properties. 
   (!) If required property is missing from currentState object, then it is set to NULL (!)
   (!) If currentState object is missing at all, then Current State is not updated, 	
but clients are notified about event (!)
Path
Required properties
/infoScreen
infoScreenState
/act
topActivityId, activityId
/issue
issueId, topActivityId, activityId
/state
all except attendRegId, totalMembersCount and attendMembersCount
(these properties are erased when current Convocation/CouncilSession changes)

Example body (for …/act):
{ 
    "topActivityId" : 4,
    "activityId" : 5
}
Example body (for …/infoScreen):
{ 
    "infoScreenState" : { "code" : "caption" }
}
 
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error"
Body: Success: updated Current State (json).
		Error: error description
Note:		Returns immediately, before all clients are notified.
Notify:		Event containing updated Current State entity and null object.


Шифрование статических ресурсов (таблица resource)
- В БД все значения ресурсов зашифрованы: 
sringValue – значение до 245 символов – RSA;
blobValue – данные до 16МБ – AES.
- В API встроен открытый ключ для их расшифровки, заменить их нельзя без знания секретного ключа.
- Все запросы к /session/rs выдают уже расшифрованные значения (api не поменялся)
- На клиентах нужно удалить все статические ресурсы (название громады, герб), и получать их только запросом. Достаточно один раз при логине их получить, и потом держать в памяти.

Изменения в существующем api:

GET  /session/voting/{id}/count 	- подсчет голосов
Теперь выдает все возможные значения vote_value, а не только те, по которым есть голоса.
Например:
{
  "count": [
    {"valueCode":"for","valueName":"За","voteCount":4},
    {"valueCode":"against","valueName":"Проти","voteCount":0},
    {"valueCode":"abstain","valueName":"Утримався","voteCount":0},
    ...
  ],
  "state": {"code":"passed", ... }
}



2017-11-20

События (нотификация)  

GET  /session/event?clientId=xxx&eventMask=(session|info-screen|…)

Long-poll request for session events. Response is sent as soon as event occurs.
Params:
clientId – Unique ID of client. Only 1 long-poll request per clientId is allowed at any time;
eventMask – Substring of event code (optional). 
Response is sent:
      - immediately if any Event occurred since the last response was sent to this client;
          (the most recent of such events is included in response);
      - when Event matching eventMask occurs (new event is included in response);
      - when new request from the same client is received (no event, empty response);
      - on timeout (no event, empty response).  
Response includes:
	- event properties: id (not used), time (long integer), code (string code of event type) 
	- currentState (state updated after event occurred)
- object (depends on event type, for voting events – contains current voting)	
Response example:
{ 
   "id":null,
   "time":1511305358829,
   "code":"session-voting-end",
   "currentState": { "id":1,"convocationId":4,... },
   "object": {"id":10,... } 
}

Event codes (updated 2017-11-24):
session-current-state-change
session-start
session-pause
session-resume
session-end
session-voting-start
session-voting-end
session-attendants-reg-start
ession-attendants-reg-end
session-current-activity-change
session-current-issue-change
ui-info-screen-state-change

Голосование  

1) POST  /session/voting – создать новое голосование

Create new Voting for existing Activity.
Creates full set of Votes for new Voting, one for each active council member, and initializes them with default values (“no-vote”).
Body: 	Describes the voting to be created.	
All Voting properties except activityId are optional. All unspecified properties are set to parameters of default VotingScenario.
{
    "activityId":  {
        "id": 3
    },
    "time": 1501918500000,
    "timer": 15,
    "endByTimer": true,
    "withPhoto": false,
    "passCondition": { "id": 2  },
    "archived": false
}
Response: 	"201 created" + location header if successful, or "unauthorized", or "bad request", or "internal server error"

2) POST  /session/voting/{id}/start – начать созданное ранее голосование, 	
с оповещением

Start a Voting (i.e. make it current voting) and notify clients. Voting instance must already exist in DB.
Affects:  CurrentState.votingId and Voting.xxxMembersCount, Votes

(!) Allows to start Voting ONLY if it has resolutionState.id=”new”, i.e. if it is not completed yet. 

To start Voting, CurrentState.attendRegId must contain the ID of the most recent completed Attendants Registration.
When Voting starts, some vote values are pre-set to "absent", according to Attendants Registration results.
Voters that were absent at the Attendants Registration still CAN submit their votes.

End by timer: 
If Voting is started with property endByTimer=1, then it is ended automatically.
If such voting is then ended explicitly, then clients will be notified with 'session-voting-end' event twice.

Param: 	id – ID of previously created Voting
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error".
              	Body: Successful: /start - Voting that was started (json);  /end – empty;	
		Error: error description
Note:		Returns immediately, before all clients are notified.
Notify:		Event containing updated CurrentState and Voting that was started.

3) POST  /session/voting/{id}/(end|stop) – завершить голосов., посчитать результат, 
с оповещением

End voting, calculate its result and broadcast the event to clients. 
	Affects:     CurrentState (erases votingId).
Voting instance and its Votes must already exist in DB.
Result is determined using passCondition and total number of voters stored in Voting (does not depend on Current state).
This method must be called ONCE for Voting immediately AFTER it is completed.
Param:	id – ID of completed Voting
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error"
Note:	Sends response with 1 sec delay, 	
after voting result is calculated, but before all clients are notified.
		Voting can pass ONLY if half of council members attend.
Notify:		Event containing updated CurrentState, completed Voting with resolutionState 	
 		and count of votes for this Voting.
{ 
   "id":null,
   "time":1511305358829,
   "code":"session-voting-end",
   "currentState": { "id":1,"convocationId":4,... },
   "object": {
        "voting": { "id":10, ..., "resolutionState":{...} },
        "voteCount": {...} 
   } 
}

4) POST  /session/voting/{id}/updateResult – пересчитать результат голосования, 	
без оповещения

Re-calculate voting results (resolutionState).
Voting instance and its Votes must already exist in DB.
Result is determined using passCondition and total number of voters stored in Voting (does not depend on Current state).
This method can be called for old Voting after updating its vote values or its passCondition.
Param:	id – ID of completed Voting
Body:	describes a new Vote (must contain votingId, value + photo (optional) )
Response: 	"ok" if successful, or "unauthorized", or "bad request", or "internal server error"
Note:		Voting can pass ONLY if half of council members attend.
Notify:		NO NOTIFICATION.

5) POST  /session/voting/{id}/vote – подать голос

Submit a Vote.  ONLY current Voting accepts votes.
Param:	id – ID of current Voting (NOT USED)
Body:	Vote to store. 	
Must contain properties: votingId, value, + photo (optional). 	
Voter (i.e. personState) is defined by authorized user.
{
    "votingId":  { "id": 5 },
    "value":  { "code": "for" },
    "photo":  "photo data - bas64"
}
 Response: 	"201 created" + location header if successful, or "unauthorized", or "bad request", or "internal server error"

Сообщения об ошибках  

По всем запросам POST в случае ответов 400, 401, 404 и 500 в теле ответа находится короткое пояснение, что пошло не так, почему нельзя выполнить действие. Пока пояснения не локализованные, но желательно дать какую-то возможность на планшете их посмотреть (например, в сервисных настройках возможность включить их отображение).





2017-11-14

БД: добавлено представление   active_council_member_view – члены совета. Учитываются только те субъекты (PersonState), которые:
а) отмечены как активные в PersonState (по каждому Person в PersonState должно быть не более 1 активной записи !);
б) имеют должность с ролью fCouncilMember=1
в) имеют ссылку на созыв (PersonStatePosition.fkConvocation), т.е. известно к какому созыву субъект относится
Использование:
		Select * from active_council_member_view where convocationNum = 5;
		Select * from active_council_member_view where convocationId = 4;
 
/subj/ps    Субъекты – ресурс изменен

1) Добавлен параметр “Включить в результат должности субъектов”. По умолчанию - false.
    (!) получение должностей требует дополнительных запросов (!)
		?withPosTitles=1|yes|true
2) Добавлен фильтр по PersonState.id. – для использования в подресурсе /ps/exists c фильтром
		?psId=1&otherFilters

Использование
	а) состав текущего созыва (активные на данный момент члены совета)
/subj/ps?active=1&fCM=1&convId=4
/subj/ps?active=1&fCM=1&convNum=5
	б) входит ли конкретный PersonState.id в состав текущего созыва
/subj/ps/exists?psId=1&active=1&fCM=1&convId=4
      в) имеется ли вообще субъект с заданным PersonState.id – без фильтров: 
/subj/ps/{id}/exists

Примечание:
- если не указать созыв (convId или convNum), то в списке могут оказаться депутаты из прошлых созывов;
- (!) если по какому-либо Person имеется несколько активных состояний (PersonState.fActive=1), то в он может дублироваться в этом списке (!).

БД: в таблицу   current  добавлены поля:
- councilMembersCout – количество членов совета (общий состав, кто может голосовать)
- attendMembersCout – количество присутствующих (по результатам последней регистрации) членов совета
Оба поля определяются/обновляются при каждой регистрации присутствующих, и используются при создании голосований.

БД: в таблицу   voting  добавлены поля:
- councilMembersCout – количество членов совета (общий состав, кто может голосовать) – на момент этого голосования
- attendMembersCout – количество присутствующих (по результатам последней регистрации) членов совета - на момент этого голосования
Оба поля записываются ТОЛЬКО при старте голосования, и используется при подсчете результатов голосования, (в т.ч. для пересчета после редактирования голосов и/или сценария голосования).

БД: в таблицу   app_user  добавлено поле: 
fSystem - флаг: системный пользователь. Системные пользователи нужны для работы системы, они не отображаются и не редактируются в админ-пенели.
и 2 системных пользователя: system-admin-panel, system-info-screen.

2017-11-10

Изменения в существующих ресурсах:
/plan/issue    
1) Добавлен фильтр по имени докладчика (работает аналогично фильтру в /subj/person). 
Ищет по всем частям имени, можно несколько слов.
		speakerName=С. Погосян
    Другие фильтры по докладчикам:
speakerPsId=13     - фильтр: докладчик, PersonState.id (НЕ Person.id)
speakerPId=13     - фильтр: докладчик, Person.id (НЕ PersonState.id)
2) В обоих представлениях (/plan/isuue и plan/issue/{id}) по умолчанию падеж в должностях докладчиков – Именительный. Поддерживается также родительный падеж:
		?gramCase=nom|gen
 
/session/doc    
1) Добавлен под-ресурс с файлом документа в base64:
/session/doc/{id}/file – бинарные данные файла
/session/doc/{id}/file/base64 – данные файла в base64 

/session/voting    
1) Добавлены фильтры (без значения): голосования не относящиеся ни к какому вопросу/проекту/решению:
			/session/voting?noIssue 
			/session/voting?noProj 
			/session/voting?noRes    
2) Добавлен фильтр: состоявшиеся/не состоявшиеся голосования. 	
Этот фильтр отменяет любой фильтр resState.
			/session/voting?completed=0|no|false
Сейчас состоявшимися считаются голосования с результатом  passed|rejected. 
Это настраиваемо, в таблицу resolution_state добавлены столбцы (fCompleted – «состоявшиеся», fForVoting – применимые для голосований). 

/session/rs    (статические ресурсы)
1) Для бинарных ресурсов добавлено json-представление в виде base64:
			/session/rs/{group}/{name}   - json/base64
			/session/rs/{group}/{name}/bin   -  бинарные данные 


2017-11-05
/session/act    
Новый ресурс   –  активность.
Методы:  
GET:   параметры:  
descr=про соц      - фильтр по названию решения (строка запроса)
draft=0|no|false   - фильтр: черновик/не черновик, по умолчанию - все
tFrom, tTo         - фильтр: диапазон времени активности
topLevel=0|no|false - фильтр: активность верхнего уровня/дочерняя
parentId=1          - фильтр: родительская активность
childId=2           - фильтр: дочерняя активность
actType=consider    - фильтр: тип активности (ActivityType.code)
pointType=res-project  - фильтр: тип объекта активности (PointType.code)
speechType=proposition - фильтр: тип выступления, инициирующего активность (SpeechType.code)
issueId=1          -  фильтр: id вопроса повестки
issueNum=2         - фильтр: учетный номер вопроса в повестке
sessionId=4        -  фильтр: id сессии
sessionNum=5       -  фильтр: учетный номер сессии
convNum=5          -  фильтр: учетный номер созыва
projId=2              - фильтр: id проекта
projNum=17/05/05      - фильтр: учетный номер проекта (подстрока)
resId=2              - фильтр: id решения
resNum=17/05/05      - фильтр: учетный номер решения (подстрока)
resState=published   - фильтр: состояние решения по проекту (принято, не принято, ...)
                       Учитываются только решения в активностях с pointType=res-project (!) и type=consider (не только нормативные)
resPassed=1|yes|true - фильтр: принятые проекты (нет фильтра по не принятым!)
                       Принятыми считаются проекты, по которым есть нормативное решение с resState=passed|head-approved|published
archived=0|no|false  - фильтр: выдавать архивированные объекты, по умолчанию - 0
orderBy=time|descr|draft|convNum|sessionNum|issueNum     - атрибуты для сортировки
                      можно совмещать несколько через запятую.
                     Default: time asc
viewMode=compact   - только для отладки, выводит объекты в сокращенном виде 
skip=1&limit=1       - для постраничного получения результатов (по умолчанию страница 100 объектов)
 
Подресурсы:  
/session/act	- список активностей
/session/act/{id} – одна активность	
/session/act/count|exists?filters... – подсчет активностей (с фильтром)

/session/doc    
Новый ресурс   –  документ.
Методы:  
GET:   параметры:  
title=про соц      - фильтр по названию документа (строка запроса) 
                     (название документа может отличаться от названия проекта/решения, 
                      к которому он относится)
dtFrom, dtTo       - фильтр: диапазон дат документа (по дате, которая указана в самом документе и отличается от времени создания файла/записи)
mime=application/pdf   -  фильтр: формат документа (точное совпадение)
type=main          -  фильтр: тип документа
projId=2              - фильтр: id решения
projNum=17/05/07      - фильтр: учетный номер решения (подстрока)
resId=2              - фильтр: id решения
resNum=17/05/05      - фильтр: учетный номер решения (подстрока)
archived=0|no|false  - фильтр: выдавать архивированные объекты, по умолчанию - 0
orderBy=title|date|lastUpdate|type   - атрибуты для сортировки, можно несколько через запятую.
               Default: если указан проект/решение - по номеру документа в проекте/решении
                        если проект/решение не указаны – по названию
viewMode=compact   - только для отладки, выводит объекты в сокращенном виде, по одной строке
skip=1&limit=1       - для постраничного получения результатов 
 
Подресурсы:  
/session/doc	- список документов, без файлов
/session/doc/{id} – один документ, без файла	
/session/doc/{id}/file – загрузка файла (если файла нет – ответ 404)	
/session/doc/count|exists?filters... – подсчет документов (с фильтром)

/session/res    
Новый ресурс   –  решение.
Методы:  
GET:   параметры:  
num=17/05/05       - фильтр: учетный номер решения (подстрока)
title=про соц      - фильтр по названию решения (строка запроса, 
                       например < 26.12,  про  >  <"про внес", соц ,, ">)
draft=0|no|false   - фильтр: черновик/не черновик, по умолчанию - все
passFrom, passTo - фильтр: диапазон дат регистрации проекта (время в формате long)
resState=published   - фильтр: состояние решения
resType=normal       - фильтр: тип решения
resPassed=1|yes|true - фильтр: принятые/не принятые решения
                       Принятыми считаются решения с resState=passed|head-approved|published
issueId=1          -  фильтр: id вопроса повестки (Resolution -> Activity -> Issue)
issueNum=2         - фильтр: учетный номер вопроса в повестке
issueState=considered -  фильтр: состояние вопроса (из IssueState.code)
sessionId=4        -  фильтр: id сессии     (Resolution -> Activity -> Session)
sessionNum=5       -  фильтр: учетный номер сессии
convNum=5          -  фильтр: учетный номер созыва
projId=3              - фильтр: id проекта
projNum=17/05/08      - фильтр: учетный номер проекта (подстрока)
archived=0|no|false  - фильтр: выдавать архивированные объекты, по умолчанию - 0
orderBy=num|title|draft|passDate|actTime|convNum|sessionNum|issueNum
                     - атрибуты для сортировки, можно совмещать несколько через запятую.
                       Default: num, actTime
                       passDate - дата принятия решения, записанная в самом решении;
                       actTime - время активности, результатом которой стало решение
viewMode=compact   - только для отладки, выводит объекты в сокращенном виде, по одной строке
skip=1&limit=1       - для постраничного получения результатов 
 
Подресурсы:  
/session/res	- список решений, краткое представление
/session/res/{id} – одно решение, 	
подробное представление со списком документов
/session/res/count|exists?filters... – подсчет решений (с фильтром)

2017-10-30
/session/proj    
Новый ресурс   – проект решения.
Методы:  
GET:   параметры:  
num=17/05/08       - фильтр: учетный номер проекта (подстрока)
title=про соц      - фильтр по названию проекта, поисковая строка,
                     например < 26.12,  про  >  <"про внес", соц ,, ">)
draft=0|no|false   - фильтр: черновик/не черновик, по умолчанию - все
introFrom, introTo - фильтр: диапазон дат регистрации проекта (в формате long)
issueId=1          - фильтр: id вопроса повестки
issueNum=2         - фильтр: учетный номер вопроса в повестке
issueState=considered -  фильтр: состояние вопроса (из IssueState.code)
sessionId=4        -  фильтр: id сессии
sessionNum=5       -  фильтр: учетный номер сессии
convNum=5          -  фильтр: учетный номер созыва
speakerPsId=14     - фильтр: докладчик по вопросу, PersonState.id (НЕ Person.id)
                     (!) будет заменено на фильтр по инициатору проекта
speakerPId=14      - фильтр: докладчик по вопросу, Person.id (НЕ PersonState.id)
                     (!) будет заменено на фильтр по инициатору проекта
resPassed=1|yes|true - фильтр: принятые проекты (нет фильтра по не принятым!)
                       Принятыми считаются проекты, по которым есть нормативное 
                       решение с resState=passed|head-approved|published
resId=2              - фильтр: id решения 
resNum=17/05/05      - фильтр: учетный номер решения (подстрока)
resState=published   - фильтр: состояние решения по проекту 
                       (принято, не принято, ...)
                       Учитываются только решения в активностях с 
                       pointType=res-project (!) и type=consider 
                       (не только нормативные)
archived=0|no|false  - фильтр: выдавать архивированные, по умолчанию - 0
orderBy=num|title|draft|convNum|sessionNum|issueNum|introDate    
               - атрибуты для сортировки, можно совмещать несколько через запятую.
               Default: convNum desc,sessionNum desc,issueNum,introDate
skip=1&limit=1       - для постраничного получения результатов 
viewMode=compact     - только для отладки
Подресурсы:  
/session/proj	- список проектов, краткое представление
/session/proj/{id} – один проект, 	
подробное представление со списком документов
/session/proj/count|exists?filters... – подсчет проектов (с фильтром)

/session/voting    
Новый ресурс   – голосование.
Методы:  
GET:   параметры:  
?activityId=1&resState=passed&sessionId=4&sessionNum=5
 &issueId=1&issueNum=1&projId=1&projNum=17/05/05&resId=2&resNum=17/05/05
 &viewMode=compact

activityId=4      -  фильтр: id активности
resState="passed" -  фильтр: результат голосования
sessionId=4       -  фильтр: id сессии
sessionNum=5      -  фильтр: учетный номер сессии
issueId=1         -  фильтр: id вопроса
issueNum=1        -  фильтр: учетный номер вопроса в повестке
projId=1          -  фильтр: id проекта решения
projNum=17/05/05  -  фильтр: учетный номер проекта решения
resId=2           -  фильтр: id решения
resNum=17/05/05   -  фильтр: учетный номер решения
archived=0|no|false - фильтр: выдавать архивированные объекты, по умолчанию - 0
skip=1&limit=1   - 
orderBy=time desc    - Default: time desc (не настраивается)
viewMode=compact     - только для отладки
Подресурсы:  
/session/voting	- краткое представление, без поименного списка голосов
/session/voting/{id} – подробно об одном голосовании, с поименным списком голосов (депутаты упорядочены по ФИО, без должностей)
/session/voting/{id}/detail  – поименный список голосов, с должностями. Использовать только если первого представления недостаточно (!).
/session/voting/{id}/count – количество голосов «за», «против» и т.д., 
а также результат голосования
/session/voting/count|exists?filters... – подсчет голосований (с фильтром)

/session/rs         -  Новый ресурс - Зашифрованные данные. 
Методы:    	GET:   
Подресурсы: 
/session/rs – список (только те, которые нужны для планшетов)
/session/rs/{group}/{name} – один ресурс по имени:
- обычные – в виде json
- картинки – в виде бинарных данных 

Изменения в существующих ресурсах:
В /plan/session и /plan/meeting добавлены новые параметры:
tFrom, tTo    - фильтр: диапазон начала сессии по времени (время в формате long)
В /plan/issue добавлены новые параметры (вместо speakerId):
speakerPsId=13     - фильтр: докладчик, PersonState.id (НЕ Person.id)
speakerPId=13     - фильтр: докладчик, Person.id (НЕ PersonState.id)

2017-10-22
Новые ресурсы (только для чтения) – 
/session/actTemplate
/session/actType
/session/currentState
/session/docType
/session/infoScreenState
/session/passCondition
/session/pointType
/session/resState
/session/resType
/session/speachState
/session/speachType
/session/voteValue
/session/votingScenario
Методы:    	GET:   
Паремтры 	?viewMode=compact   - выводит объекты в сокращенном виде
Подресурсы: 
/xxx/detail – подробное представление, с развернутыми вложенными объектами
только для /session/actTemplate
/xxx/{id} – один объект по id или code, 	
в actTemplate, votingScenario – подробное представление
/xxx/{id}/exists – проверка существования по id или code
/xxx/{exists|count} – подсчет общего количества

Изменения в существующих БД и API:
Ресурс /subj/subj переименован на /subj/ps
Session:   поля dtFrom, dtTo (Date) заменены на tFrom, tTo (TimeStamp)
Person_State_Position : добавлено поле ordinal, которое задает порядок должностей для одного субъекта 	
В API должности автоматически сортируются везде, где встречаются субъекты: в \subj\ps, \plan\issue, \plan\attendReg
Добавлена таблица issue_reporter для связи вопросов с докладчиками (пока не используется)

2017-09-17
/subj/pos   - новый ресурс – 
Должности. 
Методы:
   GET:   ? 
title=голова міськ   -  фильтр: (строка поиска) по названию должности
role=head          - фильтр: (точное совпадение) код роли
roleName=депутат   - фильтр: (подстрока) название роли
fCM=0|no|false     - фильтр: члены совета (по должности и роли)
fD=0|no|false      - фильтр: депутаты (по должности и роли)
fIS=0|no|false     - фильтр: субъекты инициативы (по должности и роли)
archived=0|no|false - фильтр: выдавать архивированные, по умолчанию - 0
skip=1&limit=1     - для постраничного получения результатов 
orderBy=title|role    - сортировка Default: "title asc"
viewMode=compact   - выводит объекты в сокращенном виде
Подресурсы: 
/subj/pos/{id} – подробное представление, (+ роль)
/subj/pos/{id}?gramCase=gen – то же, но названия в родительном падеже.
/subj/pos/{id}/exists
/subj/pos/{exists|count}?filterParams... - подсчет
2017-09-10
/subj/ps   - новый ресурс – 
Временное состояние субъекта с должностями (табл. PersonState). 
Представления: 
Полное – список должностей развернут полностью (удобно для перехода на дочерние объекты и их изменения). Названия должностей – не преобразованы.
Сокращенное – список должностей компактный (удобно для отображения списка людей). Названия должностей - переведены в родительный падеж, где необходимо (напр. «в.о. головнОГО архітекторА …»). 
Примечание: список должностей для каждого человека подгружается из БД отдельным запросом, поэтому ресурсы с списками людей с должностями (subj,issue,attendReg) запрашивать небольшими страницами (параметры запроса limit, skip). Будет еще оптимизировано.
Методы:
   GET:   ? 
personId=4         -  фильтр: id человека (Person)
active=0|no|false  - фильтр: активное/не активное состояние Default: все
date               - Фильтр: дата (формат long), работает только если указаны даты
                     начала и окончания состояний в табл. Person_State  
name="В. Хомко"    - фильтр: ФИО     Usage: аналогично /subj/person
birthFrom=1970     - фильтр: год рождения
birthTo=1990       - фильтр: год рождения
userId=5           -  фильтр: id пользователя
psId=4             -  фильтр: id субъекта (PersonState)
userName=head      -  фильтр: (подстрока) логин пользователя
posId=1            - фильтр: id должности (Position)
pos=голова міськ   -  фильтр: (строка поиска) по названию должности. 
                      Ищет по полным и сокращенным названиям
posPrefix=no|в.о.  - фильтр: (подстрока) по префиксу должности. 
                     "no" - без префикса. Default: все
role=head          - фильтр: (точное совпадение) код роли
roleName=депутат   - фильтр: (подстрока) название роли
fCM=0|no|false     - фильтр: члены совета (по должности и роли)
fD=0|no|false      - фильтр: депутаты (по должности и роли)
fIS=0|no|false     - фильтр: субъекты инициативы (по должности и роли)
convId=5           - фильтр: субъекты, входящие в состав конкретного созыва 
                     (по id, который указівается в Person_State_Position)
convNum=4          - фильтр: субъекты, входящие в состав конкретного созыва (по номеру)
skip=1&limit=1     - для постраничного получения результатов 
orderBy=name|age|pos|lastName|firstName|middleName    - сортировка 
           Default: "name,age desc,active desc,dtFrom desc"
           Последние уровни "active desc,dtFrom desc" добавляются к любой сортировке
viewMode=compact   - выводит объекты в сокращенном виде
Подресурсы: 
/subj/ps/{id} – подробное представление
/subj/ps/{id}/role – список ролей (определяется по всем должностям субъекта). Можно использовать для авторизации.
/subj/ps/{id}/role/effective – суммарные атрибуты по всем ролям субъекта. Можно использовать для авторизации.
/subj/ps/{id}/exists
/subj/ps/{exists|count}?filterParams... - подсчет
/plan/issue, /plan/attendReg   - добавлены списки должностей для субъектов. 	
В /plan/issue  все должности в родительном падеже, как в «порядке денном».
В /plan/attendReg:  подгрузка должностей сильнее всего нагружает БД, поэтому теперь будет три представления:
/plan/attendReg?params – без участников 
/plan/attendReg/{id} – c участниками, без должностей 
/plan/attendReg/{id}/detail  – участники с должностями. Использовать только если первых двух представлений недостаточно.
/subj/positionPrefix   - новый ресурс (Readonly)
Список подстановки для префикса должности (подставляется как текст, не по ВК)
Методы:
   GET:   параметры:  ? viewMode=compact
Подресурсы: 
/subj/positionPrefix/{id}
/subj/positionPrefix/{id}/exists
/subj/positionPrefix/count 
/plan/session/{id} – добавлено подробное представление (+ инф. о созыве)
2017-09-05
Все ресурсы теперь доступны только по HTTPS, порт 8443. Запросы http://server:8080/xxx автоматически перенаправляются
Добавлена авторизация (http digest). Пароли хранятся в базе в зашифрованном виде.
Тестовые пользователи (с разными ролями): admin, deputy1, deputy2, deputy3, head, ext
Пароли  - совпадают с логинами.
Пользователи MySQL:
gromada-council-app  	PW  1234567@	(red-write access to all tables; used by admin app)
gromada-council-api		PW  1234567@	(mostly read access; used by rest api)
gromada-council-realm	PW  1234567@	(read access to app_user, app_user_role, role tables;
 used by app and api authentication)
Во всех ресурсах добавлен атрибут “uri”, - адрес, по которому находится данный объект,	
для удобства обращения к вложенным объектам, когда много уровней вложенности
(!) Есть ссылки на ресурсы, которые еще не реализованы

/subj/person  
(личные данные субъектов)  - новый ресурс
Методы:
   GET:   параметры:  
?name="В.Хомко"&psId=4&userId=5&userName=head&birthFrom=1970&birth10=1990&viewMode=compact

name="В. Хомко" - фильтр: ФИО
    Usage: ф.и.о. в любом порядке через пробел,
        допускаются инициалы, в т.ч. без пробелов через точку,
        кавычки "" - не учитываются
    Tests: //  Хомко Віктор Павлович, Хом ко, віктор, ві ктор, 
               Віктор Хомко, В. Хомко, В.П.Хомко
 userId=5      -  фильтр: id пользователя
 birthFrom=1970 - фильтр: год рождения
 birthTo=1990 - фильтр: год рождения
 psId=4      -  фильтр: id субъекта (PersonState)
 userName=head      -  фильтр: логин пользователя
 archived=0|no|false - фильтр: выдавать архивированные, по умолчанию - 0
 skip=1&limit=1   - (по умолчанию страница 100 объектов)
 orderBy=name|age|lastName|firstName|middleName    
           - сортировка Default: "name,age desc"
 viewMode=compact            - в сокращенном виде 

Подресурсы: 
/subj/person/{id} – подробно об одном человеке (+связанный пользователь), без фото
/subj/person/{id}/exists
/subj/person/{id}/photo – фото, обернутое в объект JSON
/subj/person/{id}/photo/img – фото как MIME image 
/subj/person/{id}/statesCount – сколько имеет (активных и неактивных) состояний в PersonState
/subj/person/count|exists?filters... – подсчет людей с фильтром

/plan/attendReg:   
В каждой регистрации присутствующих теперь будет список ВСЕГО состава совета, т.е. явно хранятся не только присутствующие, но кто отсутствовал. Соответствующие изменения внесены в таблицу Attendant.
В подресурсе /plan/attendReg/{id}/count – метод GET возвращает несколько значений (сколько присутствовало, отсутствовало, по уважительной причине)

/plan/session 
Добавлена ссылка на список вопросов (issuesUri). Оптимизировано получение данных из БД, 
2017-08-28
/plan/issue : добавлен фильтр и сортировка по номеру созыва (convNum). Сортировка по умолчанию теперь: convNum,sessionNum,num.	
Добавлен фильтр meetingId (на случай если в одной сессии несколько заседаний). Параметр не обязательный, т.е. вопрос не обязательно связан с каким-либо заседанием!
Во всех ресурсах в параметре orderBy добавлена возможность сортировки по убыванию. Возможные значения “”=“asc”-по возрастанию, “desc”- по убыванию. Пример:
convNum desc,sessionNum desc,num
Для значений, связанных со временем (номера созывов, сессий, даты заседаний) порядок по умолчанию изменен на обратный (новые сверху).

/plan/meeting  - 
новый ресурс: пленарные заседания
Методы:
 GET:   параметры:  ?sessionId=4&sessionNum=5&sessionSpecial=no&sessionPlace=вінн&orderBy=sessionNum,time&viewMode=compact
sessionId=4      -  фильтр: id сессии
convNum=5      -  фильтр: учетный номер созыва
sessionNum=5      -  фильтр: учетный номер сессии
sessionSpecial=no      -  фильтр: внеочередная/очередная сессия
sessionPlace=вінн  - фильтр: место проведения (поисковая строка)
archived=0|no|false - фильтр: выдавать архивированные, по умолчанию - 0
skip=1&limit=1   - для постраничного получения результатов 
orderBy=convNum|sessionNum|sessionSpecial|time     - сортировка
           Default: convNum,sessionNum,time
viewMode=compact            - выводит объекты в сокращенном виде
Подресурсы:  
/plan/meeting/{id} – подробно об одном заседании
/plan/meeting/count|exists?filters... – подсчет заседаний (с фильтром)

/plan/attendReg    
Новый ресурс   – список регистраций присутствующих (м.б. несколько регистраций на одном заседании) – краткое представление. Краткое представление, без списков людей. В каждом элементе в поле detailsUri – ссылка на детальную информацию.
Методы:  
GET:   параметры:  
?comment="на початку"&meetingId=1&sessionId=4&sessionNum=5&convNum=5&viewMode=compact
meetingId=4      -  фильтр: id заседания
comment="на початку" - фильтр: комментарий
sessionId=4      -  фильтр: id сессии
convNum=5      -  фильтр: учетный номер созыва
sessionNum=5      -  фильтр: учетный номер сессии
archived=0|no|false - фильтр: выдавать архивированные, по умолчанию - 0
skip=1&limit=1   - для постраничного получения результатов 
orderBy=time     - Default: time (по убыванию) – не настраивается, один вариант
viewMode=compact            - только для отладки
Подресурсы:  
/plan/attendReg/{id} – подробно об одной регистрации, со списком присутствующих (упорядоченным по ФИО)
/plan/attendReg/{id}/count – количество присутствующих на одной регистрации
/plan/attendReg/count|exists?filters... – подсчет регистраций (с фильтром)

2017-08-25
Во все ресурсы – добавлены подресурсы:
/resource/count
/resource/exists
/resource/{id}/exists 
Действуют быстрее родительских ресурсов, поскольку не читают сами объекты из базы.
Параметры запроса для них – фильтры, такие же, как и у основного ресурса. 
Параметры, не относящиеся к фильтру (orderBy, limit, skip, viewMode), – игнорируются.
Для ресурсов, которые не поддерживают фильтры – считается общее количество объектов
Пример:
/plan/issue/count – количество всех вопросов
/plan/issue/count?speakerId=13&sessionId=4  – сколько вопросов докладывал один человек на одной сессии
/plan/issue/exists?speakerId=13&sessionId=4  – докладывал ли данный человек на данной сессии хоть один вопрос
/plan/issue/1/exists  – имеется ли вопрос с ID=1

2017-08-23
В базе изменены некоторые имена столбцов, немного изменены View (в основном тоже корректные имена столбцов проставлены)
В основных таблицах добавлен флаг fArchived (по умолч. - 0), чтобы можно было отметить строки как «удаленные в корзину», с возможностью их восстановить
В read-only таблицах, которые служат для подстановки (IssueState, Role, DocType), добавлен атрибут ordinal – порядковый номер записи для отображения пользователям. По нему же будет и сортировка по умолчанию.
Ресурс /plan/issue – добавлены фильтры:
archived=0|no|false - фильтр: выдавать архивированные (перемещенные в корзину) объекты, по умолчанию – 0
sessionNum=5       - фильтр: учетный номер сессии
speakerId=13     - фильтр: докладчик, Person.id (НЕ PersonState.id)

Полный список параметров:
 
?num=2&title="про"&draft=false&state=considered&sessionId=4&personId=13&skip=1&limit=1&orderBy=num,title,state&viewMode=compact
 
num=2  - фильтр: учетный номер (в повестке)
title=про соц  - фильтр по зазванию вопроса
draft=0|no|false - фильтр: черновик/не черновик, по умолчанию - все
state=considered  -  фильтр: состояние вопроса (из IssueState.code)
sessionId=4      -  фильтр: id сессии
sessionNum=5      -  фильтр: учетный номер сессии
speakerId=13     - фильтр: докладчик, Person.id (НЕ PersonState.id)
archived=0|no|false - фильтр: выдавать архивированные (перемещенные в корзину) объекты, 
                      по умолчанию - 0
skip=1&limit=1   - для постраничного получения результатов 
                   (по умолчанию страница 100 объектов)
orderBy=num|title|state  - варианты сортировки, можно совмещать несколько через запятую
viewMode=compact         - только для отладки, выводит объекты в очень сокращенном виде, 
                         по одной строке, чтобы легко было проверить результат в целом

Новые возможности поиска по текстовым полям (в т.ч. в /plan/issue в фильтре по названию вопроса). Теперь поддерживается сложная поисковая строка, которая передается без внешних кавычек, например:
/plan/issue?title=про соц&otherPrm…
Возможности:
поисковая строка может содержать несколько термов, 
обязательный разделитель - пробел, необязательные .,;	
ххх ууу  - порядок термов не важен	
"ххх ууу" - требует точного совпадения, в том же порядке и с учетом ВСЕХ символов, включая пробелы, знаки препинания.
За пределами кавычек " " знаки препинания .,; и лишние кавычки – отбрасываются
Последовательность символов без пробелов считается единым термом и может содержать в середине знаки препинания, например дату (26.05.2017) в кавычки брать не обязательно, но (А. С. Пушкин) эквивалентно (А С Пушкин)
Примеры :  
< 26.12 про,  > - два терма «26.12» и «про», порядок не важен	
<"про внес" ,соц  ,,,, "> - два терма «про внес» и «соц», слова «про внес» должны быть вместе, «соц» - в любом месте строки.
Изменена структура json. 	
вложенные объекты Issue.session, Issue.meeting и Session.convocation заменены на обычный атрибут ID: Issue.sessionId, Issue.meetingId и Session.convocationId. 
Для вложенных объектов, которые в json заменены на ID, также добавлен виртуальный атрибут URI – ссылка, по которой этот объект (или список объектов) можно получить: Issue.sessionUri, Issue.meetingUri и Session.convocationUri
Атрибуты типа Person.photo теперь будут доступны как отдельный подресурс, например /subj/person/13/photo. В главном ресурсе (например /subj/person) они заменяются на URI (например Person.photoUri)
Решена проблема лишних запросов для подгрузки «дочерних» объектов по связям. Например, список /plan/issue с дочерними объектами (докладчики, состояния вопросов) полностью загружается одним запросом к БД). Данные из связанных таблиц, которые не используются в результирующем json (Session, Meeting, Convocation), – не загружаются, даже если есть фильтр по ним.
Read-only ресурсы (в окончательном виде) - новые: 
/plan/issueState, /plan/issueState/{code}  
/session/docType, /session/docType/{code}  
/session/role, /session/role/{code}  
Методы:
 GET:   параметры:  viewMode
Ресурс: 	/plan/conv, /plan/conv/{id}  -  созывы  - новый
Методы:
 GET:   параметры:  ?num=5&skip=1&limit=1&viewMode=compact
 
num=2  - фильтр: учетный номер
archived=0|no|false - фильтр: выдавать архивированные (перемещенные в корзину) объекты,
                      по умолчанию – 0
skip=1&limit=1   - для постраничного получения результатов 
                   (по умолчанию страница 100 объектов)
viewMode=compact   - только для отладки
 
Ресурс: 	/plan/session, /plan/session/{id}  -  созывы  - новый
Методы:
 GET:   

?num=5&special=no&place=вінн&convId=4&convNum=5&skip=1&limit=1&orderBy=convNum,num,special&viewMode=compact

num=5  - фильтр: учетный номер (в пределах созыва)
special=0|no|false - фильтр: внеочередная/очередная, по умолчанию - все
place=вінн  - фильтр: место проведения (поисковая строка)
convId=4      -  фильтр: id сосыва
convNum=5      -  фильтр: учетный номер сосыва
archived=0|no|false - фильтр: выдавать архивированные (перемещенные в корзину)
                      , по умолчанию - 0
skip=1&limit=1   - для постраничного получения результатов 
                  (по умолчанию страница 100 объектов)
orderBy=convNum|num|special     - варианты сортировки, можно совмещать через запятую
viewMode=compact            - только для отладки

2017-08-19
Бэк-енд развернут на  http://176.36.42.106:8080/council/rs
Ресурс /plan/issue/ - список вопросов повестки
Метод GET. Параметры запроса:
?num=2&title="про"&fDraft=false&state=considered&sessionId=4&skip=1&limit=1&orderBy=title,state&viewMode=compact
Подресурс: /plan/issue/{id} - один вопрос повестки.
Примечание. Возвращаемый объект слишком большой (покрывает слишком большую часть графа объектов), многие его части дальше будут заменены на ссылки или id дочерних объектов. 

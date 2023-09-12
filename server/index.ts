import bodyParser from 'body-parser';
import express from 'express';
import { concatMap, delay, from, of } from 'rxjs';

const app = express();

app.listen(3000, () => {
  console.log('start listening');
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

const messages = ['안녕', '하', '세요', '만나서', '반갑', '습니다', 'ㅋㅋ'];

const headers = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
};

app.get('/stream', (req, res) => {
  res.writeHead(201, headers);

  from(messages)
    .pipe(concatMap((x) => of(x).pipe(delay(500))))
    .subscribe((message) => {
      res.write(`data: ${JSON.stringify({ message })}\n\n`);

      if (messages.findIndex((x) => x === message) === messages.length - 1) {
        res.write(`data: ${JSON.stringify({ end: '[DONE]' })}`);
      }
    });

  req.on('close', () => {
    console.log('closed connection from client');
  });
});

// TODO: mock error case
// app.get('/stream/error', (req, res) => {
//   res.writeHead(201, headers);

//   from(messages)
//     .pipe(concatMap((x) => of(x).pipe(delay(500))))
//     .subscribe((message) => {

//     });

//   req.on('close', () => {
//     console.log('closed connection from client');
//   });
// });

export default app;

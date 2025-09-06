cronAdd('logs_tg', '*/1 * * * *', e => {
  const botToken = $app.findFirstRecordByData('backups_meta', 'key', 'botToken').get('value')
  const chatId = $app.findFirstRecordByData('backups_meta', 'key', 'chatId').get('value')
  const lastLogId = $app.findFirstRecordByData('backups_meta', 'key', 'lastLog')
  let logs = arrayOf(new DynamicModel({ id: '', created: '', message: '', level: 0, data: {} }))

  $app.logQuery().andWhere($dbx.exp('level = 8')).orderBy('created DESC').limit(30).all(logs)

  const lastLog = logs.find(({ id }) => id === lastLogId.get('value'))
  const newLogs = !lastLog ? logs : logs.slice(0, logs.indexOf(lastLog))

  const text = newLogs.map(
    ({ message, data }) => [ message, data.get('error') ].filter(Boolean).join(': ')
  ).join('\n').trim()

  if (text) {
    $http.send({
      url: `https://api.telegram.org/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        chat_id: chatId,
        parse_mode: 'html',
      }),
    })

    lastLogId.set('value', logs[0].id)
    $app.save(lastLogId)
  }
})

cronAdd("backups_tg", "*/5 * * * *", () => {
  const botToken = $app.findFirstRecordByData('backups_meta', 'key', 'botToken').get('value')
  const chatId = $app.findFirstRecordByData('backups_meta', 'key', 'chatId').get('value')
  const lastFile = $app.findFirstRecordByData('backups_meta', 'key', 'lastFile')

  const dir = `${__hooks}/../pb_data/backups`

  const file2date = file => parseInt(file.replace('.zip', '').split('_').pop())

  const files = $os.readDir(dir).map(i => i.name()).filter(i => i.endsWith('.zip'))
  const maxDate = files.map(file2date).reduce((m, c) => c > m ? c : m, 0)
  const maxFile = files.find(i => file2date(i) === maxDate)

  if (lastFile.get('value') !== maxFile) {
    const form = new FormData();

    form.append('chat_id', chatId);
    form.append('document', $filesystem.fileFromPath(`${dir}/${maxFile}`));

    $http.send({
      url: `https://api.telegram.org/bot${botToken}/sendDocument`,
      method: 'POST',
      body: form,
    })

    lastFile.set('value', maxFile)
    $app.save(lastFile)
  }
})

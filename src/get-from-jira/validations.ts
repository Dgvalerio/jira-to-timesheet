import type {
  Conflict,
  DaySchedule,
  LunchViolation,
  TimeSlot,
  WorklogEntry,
} from '@/get-from-jira/types';

import {
  format,
  parse,
  differenceInMinutes,
  areIntervalsOverlapping,
  compareAsc,
} from 'date-fns';

export const groupByDay = (entries: WorklogEntry[]): DaySchedule => {
  return entries.reduce((schedule, entry) => {
    const date = format(entry.date, 'dd/MM/yyyy');
    const slot: TimeSlot = {
      initial: entry.startTime,
      final: entry.endTime,
    };

    return {
      ...schedule,
      [date]: schedule[date] ? [...schedule[date], slot] : [slot],
    };
  }, {} as DaySchedule);
};

export const calculateTotalTime = (entries: WorklogEntry[]): void => {
  const totalMinutes = entries.reduce((total, entry) => {
    const start = parse(entry.startTime, 'HH:mm', new Date());
    const end = parse(entry.endTime, 'HH:mm', new Date());

    return total + differenceInMinutes(end, start);
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  console.log(
    `\n⏱️  Total: ${hours} horas e ${minutes} minutos (${hours}:${String(minutes).padStart(2, '0')})\n`
  );
};

export const checkTimeOrder = (entries: WorklogEntry[]): void => {
  console.log('# Analisando ordem dos horários\n');

  const errors = entries
    .filter((entry) => entry.startTime >= entry.endTime)
    .map((entry) => ({
      date: format(entry.date, 'dd/MM/yyyy'),
      error: `${entry.startTime} >= ${entry.endTime}`,
    }));

  if (errors.length > 0) {
    console.log('❌ Erros encontrados:');
    console.table(errors);
  } else {
    console.log('✅ O horário final sempre é maior que o inicial!');
  }

  console.log('');
};

export const checkTimeConflicts = (schedule: DaySchedule): void => {
  console.log('# Verificando conflitos de horário\n');

  const conflicts: Conflict[] = [];

  for (const [date, slots] of Object.entries(schedule)) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i]!;
        const slot2 = slots[j]!;

        const start1 = parse(
          `${date} ${slot1.initial}`,
          'dd/MM/yyyy HH:mm',
          new Date()
        );
        const end1 = parse(
          `${date} ${slot1.final}`,
          'dd/MM/yyyy HH:mm',
          new Date()
        );
        const start2 = parse(
          `${date} ${slot2.initial}`,
          'dd/MM/yyyy HH:mm',
          new Date()
        );
        const end2 = parse(
          `${date} ${slot2.final}`,
          'dd/MM/yyyy HH:mm',
          new Date()
        );

        if (
          areIntervalsOverlapping(
            { start: start1, end: end1 },
            { start: start2, end: end2 },
            { inclusive: false }
          )
        ) {
          conflicts.push({ date, slot1, slot2 });
        }
      }
    }
  }

  if (conflicts.length > 0) {
    console.log(`⚠️  ${conflicts.length} conflito(s) encontrado(s):\n`);
    conflicts.forEach(({ date, slot1, slot2 }) => {
      console.log(
        `${date}: ${slot1.initial}-${slot1.final} ⚠️  ${slot2.initial}-${slot2.final}`
      );
    });
  } else {
    console.log('✅ Sem conflitos!');
  }

  console.log('');
};

/* const checkLunchBreak = (schedule: DaySchedule): void => {
  console.log('# Verificando 1h de horário de almoço (Exemplo: 12:00-13:00)\n');

  const violations: LunchViolation[] = [];

  for (const [date, slots] of Object.entries(schedule)) {
    for (const slot of slots) {
      const slotStart = parse(
        `${date} ${slot.initial}`,
        'dd/MM/yyyy HH:mm',
        new Date()
      );
      const slotEnd = parse(
        `${date} ${slot.final}`,
        'dd/MM/yyyy HH:mm',
        new Date()
      );
      const lunchStart = parse(`${date} 12:00`, 'dd/MM/yyyy HH:mm', new Date());
      const lunchEnd = parse(`${date} 13:00`, 'dd/MM/yyyy HH:mm', new Date());

      if (
        areIntervalsOverlapping(
          { start: slotStart, end: slotEnd },
          { start: lunchStart, end: lunchEnd },
          { inclusive: false }
        )
      ) {
        violations.push({ date, slot });
      }
    }
  }

  if (violations.length > 0) {
    console.log(
      `⚠️  ${violations.length} violação(ões) do horário de almoço:\n`
    );
    violations.forEach(({ date, slot }) => {
      console.log(`${date}: ${slot.initial}-${slot.final} invade 12:00-13:00`);
    });
  } else {
    console.log('✅ Horário de almoço respeitado!');
  }

  console.log('');
};*/

export const checkLunchBreak = (schedule: DaySchedule): void => {
  console.log('# Verificando intervalos de 1h (Dinâmico)\n');

  const violations: LunchViolation[] = [];

  for (const [date, slots] of Object.entries(schedule)) {
    // Se tiver 0 ou 1 slot, assumimos que não houve intervalo ENTRE tarefas.
    // (Dependendo da regra de negócio, 1 slot de 9h de duração seria violação).
    if (slots.length <= 1) {
      // Se tiver 1 slot, marca ele como violação. Se 0, ignora.
      if (slots.length === 1) violations.push({ date, slot: slots[0] });
      continue;
    }

    // 1. Parse e Ordenação
    const parsedSlots = slots
      .map((slot) => ({
        original: slot,
        start: parse(`${date} ${slot.initial}`, 'dd/MM/yyyy HH:mm', new Date()),
        end: parse(`${date} ${slot.final}`, 'dd/MM/yyyy HH:mm', new Date()),
      }))
      .sort((a, b) => compareAsc(a.start, b.start));

    // 2. Merge de Overlaps (Achatamento da agenda)
    // Precisamos saber os blocos REAIS de ocupação
    const mergedIntervals: { start: Date; end: Date }[] = [];
    let current = { start: parsedSlots[0].start, end: parsedSlots[0].end };

    for (let i = 1; i < parsedSlots.length; i++) {
      const next = parsedSlots[i];

      if (next.start < current.end) {
        // Sobreposição: estende o final se necessário
        current.end = next.end > current.end ? next.end : current.end;
      } else {
        // Sem sobreposição: fecha o bloco atual
        mergedIntervals.push(current);
        current = { start: next.start, end: next.end };
      }
    }
    mergedIntervals.push(current);

    // 3. Verificação de Gaps
    let hasOneHourGap = false;

    // Se após o merge sobrar apenas 1 intervalo, significa que foi tudo encadeado
    if (mergedIntervals.length > 1) {
      for (let i = 0; i < mergedIntervals.length - 1; i++) {
        const endCurrent = mergedIntervals[i].end;
        const startNext = mergedIntervals[i + 1].start;

        if (differenceInMinutes(startNext, endCurrent) >= 60) {
          hasOneHourGap = true;
          break;
        }
      }
    }

    // 4. Registro da Violação (Mantendo a interface imutável)
    if (!hasOneHourGap) {
      // Como não podemos mudar a interface, usamos o ÚLTIMO slot do dia
      // como o "slot da violação" para satisfazer o contrato { date, slot }.
      violations.push({
        date,
        slot: parsedSlots[parsedSlots.length - 1].original,
      });
    }
  }

  // Report
  if (violations.length > 0) {
    console.log(
      `⚠️  ${violations.length} dia(s) sem intervalo de 1h entre tarefas:\n`
    );
    violations.forEach(({ date, slot }) => {
      // Exibe o último slot apenas como referência
      console.log(
        `${date}: Agenda contínua (terminando em ${slot.final}) sem pausas suficientes.`
      );
    });
  } else {
    console.log('✅ Intervalo de 1h respeitado em todos os dias!');
  }

  console.log('');
};

export const validateWorklogs = (entries: WorklogEntry[]): void => {
  console.log('\n==================== VALIDAÇÕES ====================\n');

  calculateTotalTime(entries);
  checkTimeOrder(entries);

  const schedule = groupByDay(entries);

  checkTimeConflicts(schedule);

  checkLunchBreak(schedule);

  console.log('====================================================\n');
};

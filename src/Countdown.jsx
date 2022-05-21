import { createCountdownFromNow } from '@solid-primitives/date'

export default function Countdown (props) {
    const [countdown] = createCountdownFromNow(props.date);

    return <span class="text-xs">{`${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`}</span>
}
const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);
  
    if (seconds < 60) return `Hace ${seconds} segundos`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} horas`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} dias`;
  };

export default timeAgo;
import { db } from './db'

export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const setting = await db.systemSetting.findUnique({ where: { key: 'maintenance_mode' } })
    return setting?.value === 'true'
  } catch {
    return process.env.MAINTENANCE_MODE === 'true'
  }
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  await db.systemSetting.upsert({
    where: { key: 'maintenance_mode' },
    update: { value: enabled ? 'true' : 'false', type: 'boolean' },
    create: { key: 'maintenance_mode', value: enabled ? 'true' : 'false', type: 'boolean' },
  })
}
